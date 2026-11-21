/**
 * Catalog data access (spec 012). Server only: pages and layouts call these;
 * client components get the results as props or through CatalogProvider.
 *
 * - Money stays in paise; it becomes rupees only at display (lib/catalog/format.ts).
 * - Products with isActive = false are never returned.
 * - "Recommended" order = Best Seller rank first, then the rest by id.
 * - Every read calls connection(), so pages render per request and the build never needs a database.
 */
import { connection } from "next/server";
import { cache } from "react";
import type { Prisma } from "../../generated/prisma/client";
import { db } from "../db";
import { averageRating } from "./reviews";
import {
  toSummary,
  type CatalogCategory,
  type ProductDetail,
  type ProductReview,
  type ProductSpec,
  type ProductSummary,
  type ReviewSummary,
} from "./types";

const PRODUCT_INCLUDE = {
  category: { select: { slug: true } },
  variants: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof PRODUCT_INCLUDE }>;

const RECOMMENDED_ORDER: Prisma.ProductOrderByWithRelationInput[] = [
  { bestSellerRank: { sort: "asc", nulls: "last" } },
  { id: "asc" },
];

const ACTIVE = { isActive: true } as const;

/* Mapping ------------------------------------------------------------ */

function toSpecs(value: Prisma.JsonValue): ProductSpec[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const { label, value: v } = item as Record<string, unknown>;
      if (typeof label === "string" && typeof v === "string") return [{ label, value: v }];
    }
    return [];
  });
}

function toDetail(row: ProductRow): ProductDetail {
  const [first, ...rest] = row.images;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category.slug,
    brand: row.brand,
    pricePaise: row.pricePaise,
    originalPricePaise: row.originalPricePaise,
    onSale: row.onSale,
    gstRateBps: row.gstRateBps,
    images: [first ?? "", ...rest],
    variants: row.variants.map((v) => ({
      id: v.id,
      name: v.name,
      value: v.value,
      pricePaise: v.pricePaise ?? row.pricePaise,
      stock: v.stock,
    })),
    stock: row.stock,
    shortDescription: row.shortDescription,
    description: row.description,
    specs: toSpecs(row.specs),
    inBox: row.inBox,
    deliveryDays: row.deliveryDays,
    returnDays: row.returnDays,
    warrantyText: row.warrantyText,
    returnPolicy: row.returnPolicy,
    collections: row.collections,
    bestSellerRank: row.bestSellerRank,
  };
}

const isRating = (n: number): n is ProductReview["rating"] =>
  Number.isInteger(n) && n >= 1 && n <= 5;

/* Reads -------------------------------------------------------------- */

/** Every active product with its variants, in recommended order. */
export const getAllProducts = cache(async (): Promise<ProductDetail[]> => {
  await connection();
  const rows = await db().product.findMany({
    where: ACTIVE,
    include: PRODUCT_INCLUDE,
    orderBy: RECOMMENDED_ORDER,
  });
  return rows.map(toDetail);
});

/** Card data for every active product (listing, search), in recommended order. */
export async function getProductSummaries(): Promise<ProductSummary[]> {
  return (await getAllProducts()).map(toSummary);
}

/** Homepage Best Seller grid, by rank. */
export async function getBestSellers(): Promise<ProductSummary[]> {
  return (await getAllProducts()).filter((p) => p.bestSellerRank !== null).map(toSummary);
}

/** Products in a homepage collection ("popular", "featured"). */
export async function getProductsInCollection(collection: string): Promise<ProductDetail[]> {
  return (await getAllProducts()).filter((p) => p.collections.includes(collection));
}

export const getProductById = cache(async (id: string): Promise<ProductDetail | null> => {
  await connection();
  const row = await db().product.findFirst({ where: { id, ...ACTIVE }, include: PRODUCT_INCLUDE });
  return row ? toDetail(row) : null;
});

export const getProductBySlug = cache(async (slug: string): Promise<ProductDetail | null> => {
  await connection();
  const row = await db().product.findFirst({ where: { slug, ...ACTIVE }, include: PRODUCT_INCLUDE });
  return row ? toDetail(row) : null;
});

/** Up to `limit` active products from the same category, excluding the product itself. */
export async function getSimilarProducts(
  product: Pick<ProductDetail, "id" | "category">,
  limit = 4,
): Promise<ProductSummary[]> {
  await connection();
  const rows = await db().product.findMany({
    where: { ...ACTIVE, category: { slug: product.category }, id: { not: product.id } },
    include: PRODUCT_INCLUDE,
    orderBy: RECOMMENDED_ORDER,
    take: limit,
  });
  return rows.map((row) => toSummary(toDetail(row)));
}

export const getCategories = cache(async (): Promise<CatalogCategory[]> => {
  await connection();
  return db().category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, slug: true, name: true, sortOrder: true },
  });
});

export async function getCategoryBySlug(slug: string): Promise<CatalogCategory | null> {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

/** Published reviews, oldest first, with the average rating and count. */
export async function getProductReviews(productId: string): Promise<ReviewSummary> {
  await connection();
  const rows = await db().review.findMany({
    where: { productId, status: "published", product: ACTIVE },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  const reviews = rows.flatMap((r): ProductReview[] =>
    isRating(r.rating)
      ? [
          {
            id: r.id,
            author: r.authorName,
            rating: r.rating,
            date: r.createdAt.toISOString().slice(0, 10),
            text: r.body,
          },
        ]
      : [],
  );
  return { reviews, average: averageRating(reviews), count: reviews.length };
}

/* Writes (admin, not used by any route yet) -------------------------- */

export type ProductWriteInput = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  shortDescription: string;
  description?: string | null;
  pricePaise: number;
  originalPricePaise?: number | null;
  onSale?: boolean;
  gstRateBps?: number | null;
  stock?: number;
  deliveryDays?: number | null;
  returnDays?: number | null;
  warrantyText?: string | null;
  returnPolicy?: string | null;
  inBox?: string[];
  specs?: ProductSpec[];
  images: string[];
  collections?: string[];
  bestSellerRank?: number | null;
  isActive?: boolean;
};

/** Money, GST, stock and day counts must be non-negative integers. No floats. */
function assertIntegers(input: Partial<ProductWriteInput>) {
  const fields = [
    "pricePaise",
    "originalPricePaise",
    "gstRateBps",
    "stock",
    "deliveryDays",
    "returnDays",
  ] as const;
  for (const field of fields) {
    const value = input[field];
    if (value === undefined || value === null) continue;
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error(`${field} must be a non-negative integer, got ${value}`);
    }
  }
}

function toData(input: Partial<ProductWriteInput>) {
  assertIntegers(input);
  const { specs, ...rest } = input;
  return specs === undefined ? rest : { ...rest, specs: specs as Prisma.InputJsonValue };
}

export async function createProduct(input: ProductWriteInput): Promise<ProductDetail> {
  const row = await db().product.create({ data: toData(input) as Prisma.ProductUncheckedCreateInput, include: PRODUCT_INCLUDE });
  return toDetail(row);
}

export async function updateProduct(
  id: string,
  input: Partial<Omit<ProductWriteInput, "id">>,
): Promise<ProductDetail> {
  const row = await db().product.update({
    where: { id },
    data: toData(input) as Prisma.ProductUncheckedUpdateInput,
    include: PRODUCT_INCLUDE,
  });
  return toDetail(row);
}
