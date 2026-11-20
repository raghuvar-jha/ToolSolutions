/**
 * Product listing page (spec 007): the product list, URL filters
 * (category, q, max, sort), filtering, sorting and the delivery text.
 * Filters live in the URL so refresh, back and shared links keep the results.
 */
import { CATEGORIES, categoryHref } from "./categories";
import {
  BEST_SELLERS,
  PRODUCT_DETAILS,
  toCardProduct,
  type BestSellerProduct,
} from "./Products";

export type ListingProduct = BestSellerProduct & { deliveryDays?: number };

/**
 * Every product in lib/Products.ts once (BEST_SELLERS repeats some IDs),
 * in data order. deliveryDays comes only from the product-page data, so
 * products without it never show a delivery time.
 */
export const LISTING_PRODUCTS: ListingProduct[] = (() => {
  const details = new Map(PRODUCT_DETAILS.map((d) => [d.id, d]));
  const byId = new Map<string, ListingProduct>();
  for (const p of BEST_SELLERS) {
    if (!byId.has(p.id)) {
      byId.set(p.id, { ...p, deliveryDays: details.get(p.id)?.deliveryDays });
    }
  }
  for (const d of PRODUCT_DETAILS) {
    if (!byId.has(d.id)) {
      byId.set(d.id, { ...toCardProduct(d), deliveryDays: d.deliveryDays });
    }
  }
  return [...byId.values()];
})();

/* Price slider ------------------------------------------------------ */

export const PRICE_MIN = 500;
const PRICE_ROUND = 500;
/** Highest price in the data, rounded up to the next ₹500 (₹4,899 → ₹5,000). */
export const PRICE_MAX =
  Math.ceil(Math.max(...LISTING_PRODUCTS.map((p) => p.price)) / PRICE_ROUND) *
  PRICE_ROUND;
export const PRICE_STEP = 100;

/* Sort -------------------------------------------------------------- */

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];
const DEFAULT_SORT: SortKey = "recommended";
const isSortKey = (v: string): v is SortKey =>
  SORT_OPTIONS.some((o) => o.value === v);

/* URL filters ------------------------------------------------------- */

export type ListingFilters = {
  /** Category slug from the path (/category/[slug]); null = all products. */
  category: string | null;
  /** Search text (trimmed); "" = no search. */
  q: string;
  /** Maximum price; null = no limit (slider at the top). */
  max: number | null;
  sort: SortKey;
};

export type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v) ?? "";

const MAX_QUERY_LENGTH = 100;

/** Read the filters from a page's searchParams (bad values fall back to defaults). */
export function readFilters(
  params: SearchParams,
  category: string | null = null,
): ListingFilters {
  const q = first(params.q).trim().slice(0, MAX_QUERY_LENGTH);

  const rawMax = Number.parseInt(first(params.max), 10);
  const max =
    Number.isFinite(rawMax) && rawMax < PRICE_MAX
      ? Math.max(PRICE_MIN, rawMax)
      : null;

  const rawSort = first(params.sort);
  const sort = isSortKey(rawSort) ? rawSort : DEFAULT_SORT;

  return { category, q, max, sort };
}

/** URL for a set of filters. Defaults are left out to keep links short. */
export function listingHref(filters: ListingFilters): string {
  const path = filters.category ? categoryHref(filters.category) : "/products";
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.max !== null && filters.max < PRICE_MAX) {
    params.set("max", String(filters.max));
  }
  if (filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

/** True when a search or price limit narrows the results (category not counted). */
export const hasNarrowingFilters = (f: ListingFilters) =>
  f.q !== "" || f.max !== null;

export const getCategory = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);

/* Filtering and sorting --------------------------------------------- */

const byName = new Intl.Collator("en-IN", { sensitivity: "base" });

/** Search matches the product name or its category name, ignoring case. */
const matchesSearch = (p: ListingProduct, q: string) =>
  p.name.toLowerCase().includes(q) ||
  (getCategory(p.category)?.name.toLowerCase().includes(q) ?? false);

/** Filter (category, search, max price) then sort. Recommended = data order. */
export function applyFilters(
  products: ListingProduct[],
  filters: ListingFilters,
): ListingProduct[] {
  const q = filters.q.toLowerCase();
  const result = products.filter(
    (p) =>
      (!filters.category || p.category === filters.category) &&
      (!q || matchesSearch(p, q)) &&
      (filters.max === null || p.price <= filters.max),
  );

  switch (filters.sort) {
    case "price-asc":
      return result.sort((a, b) => a.price - b.price);
    case "price-desc":
      return result.sort((a, b) => b.price - a.price);
    case "name-asc":
      return result.sort((a, b) => byName.compare(a.name, b.name));
    default:
      return result;
  }
}

/* Text -------------------------------------------------------------- */

/** "1 Day Delivery" / "3 Day Delivery"; null when the time isn't known. */
export function deliveryText(days?: number): string | null {
  if (days === undefined || !Number.isFinite(days) || days < 1) return null;
  return `${days} Day Delivery`;
}

/** Listing heading: search results, else the category name, else "All Products". */
export function listingTitle(q: string, categoryName?: string | null): string {
  if (q) {
    return categoryName
      ? `Results for “${q}” in ${categoryName}`
      : `Results for “${q}”`;
  }
  return categoryName ?? "All Products";
}

export const countText = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;
