/**
 * Catalog seed (spec 012). Run with `npm run db:seed` (= `prisma db seed`).
 *
 * Reads the existing data in lib/Products.ts and lib/categories.ts. Nothing is retyped here.
 * Rupees become integer paise. Safe to run twice: every row is upserted by its id or slug.
 * Refuses to run when NODE_ENV is "production". Point .env at a Neon dev branch, not production.
 */
import "dotenv/config";
import type { Prisma } from "../generated/prisma/client";
import { createPrismaClient } from "../lib/prisma-client";
import { CATEGORIES } from "../lib/categories";
import {
  BEST_SELLERS,
  PRODUCT_DETAILS,
  Products as HOME_PRODUCTS,
  type ProductDetail,
} from "../lib/Products";

// Before anything touches the database. (Imports above have no side effects.)
if (process.env.NODE_ENV === "production") {
  console.error('Seed refused: NODE_ENV is "production". Seed only local or staging databases.');
  process.exit(1);
}

/* Conversions -------------------------------------------------------- */

/** Whole or fractional rupees → integer paise. Throws on anything that isn't a valid amount. */
function toPaise(rupees: number, what: string): number {
  if (!Number.isFinite(rupees) || rupees < 0) throw new Error(`Bad price for ${what}: ${rupees}`);
  const paise = Math.round(rupees * 100);
  if (!Number.isSafeInteger(paise)) throw new Error(`Price too large for ${what}: ${rupees}`);
  return paise;
}

/** "2026-10-02" → midnight UTC, so the repository can return the same date string. */
function toDate(isoDate: string, what: string): Date {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`Bad date for ${what}: ${isoDate}`);
  return date;
}

/* Source data -------------------------------------------------------- */

/** Detail fields that products only listed in BEST_SELLERS don't have. */
type OptionalDetail = "originalPrice" | "deliveryDays" | "warrantyText" | "returnPolicy";

type SourceProduct = Omit<ProductDetail, OptionalDetail> & {
  originalPrice?: number;
  deliveryDays?: number;
  warrantyText?: string;
  returnPolicy?: string;
  collections: string[];
  bestSellerRank: number | null;
};

/**
 * One record per product id (plan decisions D1–D4):
 * - PRODUCT_DETAILS wins where a product is in both lists (D3).
 * - Products only in BEST_SELLERS get empty detail fields.
 * - Best Seller rank = first position in BEST_SELLERS; repeats are dropped (D2).
 * - Homepage collections come from the `Products` list, matched by name (D1).
 */
function buildSource() {
  const byId = new Map<string, SourceProduct>();
  const rankOf = (id: string) => {
    const index = BEST_SELLERS.findIndex((b) => b.id === id);
    return index === -1 ? null : index;
  };

  for (const d of PRODUCT_DETAILS) {
    byId.set(d.id, { ...d, collections: [], bestSellerRank: rankOf(d.id) });
  }
  for (const b of BEST_SELLERS) {
    if (byId.has(b.id)) continue;
    byId.set(b.id, {
      id: b.id,
      name: b.name,
      slug: b.slug,
      category: b.category,
      brand: "Tools Solutions",
      price: b.price,
      originalPrice: b.originalPrice,
      onSale: b.onSale,
      images: [b.image],
      variants: [],
      stock: 0,
      shortDescription: "",
      specs: [],
      inBox: [],
      reviews: [],
      collections: [],
      bestSellerRank: rankOf(b.id),
    });
  }

  const unmatched: string[] = [];
  for (const h of HOME_PRODUCTS) {
    const match = [...byId.values()].find((p) => p.name === h.name);
    if (!match) {
      unmatched.push(`${h.id} "${h.name}"`);
      continue;
    }
    for (const c of h.collections) {
      if (!match.collections.includes(c)) match.collections.push(c);
    }
  }

  const products = [...byId.values()];
  return {
    products,
    unmatched,
    variantCount: products.reduce((n, p) => n + p.variants.length, 0),
    reviewCount: products.reduce((n, p) => n + p.reviews.length, 0),
  };
}

/* Seed --------------------------------------------------------------- */

async function main() {
  const prisma = createPrismaClient(process.env.DATABASE_URL);

  try {
    const source = buildSource();
    const knownCategories = new Set(CATEGORIES.map((c) => c.slug));
    for (const p of source.products) {
      if (!knownCategories.has(p.category)) {
        throw new Error(`${p.id} uses unknown category "${p.category}"`);
      }
    }

    await prisma.$transaction(
      async (tx) => {
        const categoryIds = new Map<string, string>();
        for (const [sortOrder, c] of CATEGORIES.entries()) {
          const row = await tx.category.upsert({
            where: { slug: c.slug },
            create: { slug: c.slug, name: c.name, sortOrder },
            update: { name: c.name, sortOrder },
          });
          categoryIds.set(c.slug, row.id);
        }

        for (const p of source.products) {
          const data = {
            slug: p.slug,
            name: p.name,
            brand: p.brand,
            categoryId: categoryIds.get(p.category)!,
            shortDescription: p.shortDescription,
            pricePaise: toPaise(p.price, p.id),
            originalPricePaise:
              p.originalPrice === undefined ? null : toPaise(p.originalPrice, `${p.id} original`),
            onSale: p.onSale,
            gstRateBps: null, // D5: no GST rates in the source; prices are GST-inclusive.
            stock: p.stock,
            deliveryDays: p.deliveryDays ?? null,
            warrantyText: p.warrantyText ?? null,
            returnPolicy: p.returnPolicy ?? null,
            inBox: p.inBox,
            specs: p.specs as unknown as Prisma.InputJsonValue,
            images: [...p.images],
            collections: p.collections,
            bestSellerRank: p.bestSellerRank,
          };
          // Upsert by id; a different product already holding this slug fails on the unique index.
          await tx.product.upsert({ where: { id: p.id }, create: { id: p.id, ...data }, update: data });

          for (const [sortOrder, v] of p.variants.entries()) {
            const id = `${p.id}:${v.value}`;
            const variant = {
              name: v.name,
              value: v.value,
              pricePaise: toPaise(v.price, id),
              stock: v.stock,
              sortOrder,
            };
            await tx.productVariant.upsert({
              where: { id },
              create: { id, productId: p.id, ...variant },
              update: variant,
            });
          }

          for (const r of p.reviews) {
            const review = {
              authorName: r.author,
              rating: r.rating,
              body: r.text,
              createdAt: toDate(r.date, r.id),
              isSample: true,
              status: "published" as const,
            };
            await tx.review.upsert({
              where: { id: r.id },
              create: { id: r.id, productId: p.id, ...review },
              update: review,
            });
          }
        }
      },
      { timeout: 60_000 },
    );

    const ids = source.products.map((p) => p.id);
    const [products, variants, reviews, categories] = await Promise.all([
      prisma.product.count({ where: { id: { in: ids } } }),
      prisma.productVariant.count({ where: { productId: { in: ids } } }),
      prisma.review.count({ where: { productId: { in: ids }, isSample: true } }),
      prisma.category.count({ where: { slug: { in: [...knownCategories] } } }),
    ]);

    const rows = [
      ["categories", categories, CATEGORIES.length],
      ["products", products, source.products.length],
      ["variants", variants, source.variantCount],
      ["reviews", reviews, source.reviewCount],
    ] as const;
    for (const [name, actual, expected] of rows) {
      console.log(`${name.padEnd(10)} ${actual} (source ${expected})`);
    }
    if (source.unmatched.length > 0) {
      console.log(`Skipped homepage demo cards with no catalog product: ${source.unmatched.join(", ")}`);
    }

    const mismatches = rows.filter(([, actual, expected]) => actual !== expected);
    if (mismatches.length > 0) {
      throw new Error(`Seed counts don't match lib/Products.ts: ${mismatches.map(([n]) => n).join(", ")}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
