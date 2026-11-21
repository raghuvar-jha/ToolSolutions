/**
 * Catalog types shared by the repository (server) and the UI (server and client).
 * Plain, serialisable data only. Money is integer paise; GST is basis points.
 */

export type ProductSpec = { label: string; value: string };

export type ProductVariant = {
  /** "{productId}:{value}". */
  id: string;
  /** Option group shown above the chips, e.g. "Model" or "Size". */
  name: string;
  /** Chip text, e.g. "13 mm". The cart stores this as its variant id. */
  value: string;
  /** Already falls back to the product price when the variant has none. */
  pricePaise: number;
  stock: number;
};

export type ProductReview = {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** ISO date, e.g. "2026-10-02". */
  date: string;
  text: string;
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  /** Category slug. */
  category: string;
  brand: string;
  /** Base selling price (the first variant's price when variants exist). */
  pricePaise: number;
  /** Pre-sale price; struck through only when higher than the current price. */
  originalPricePaise: number | null;
  onSale: boolean;
  /** null = GST is included in the price. */
  gstRateBps: number | null;
  /** At least one image; the first is the main image. */
  images: [string, ...string[]];
  variants: ProductVariant[];
  /** Stock when the product has no variants. */
  stock: number;
  shortDescription: string;
  description: string | null;
  specs: ProductSpec[];
  inBox: string[];
  deliveryDays: number | null;
  returnDays: number | null;
  warrantyText: string | null;
  returnPolicy: string | null;
  /** Homepage sections: "popular", "featured". */
  collections: string[];
  /** Position in the homepage Best Seller grid; null = not a best seller. */
  bestSellerRank: number | null;
};

/** What the product cards need. */
export type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  category: string;
  pricePaise: number;
  originalPricePaise: number | null;
  onSale: boolean;
  image: string;
  deliveryDays: number | null;
};

export type CatalogCategory = { id: string; slug: string; name: string; sortOrder: number };

export type ReviewSummary = {
  reviews: ProductReview[];
  /** One decimal, or null when there are no reviews. */
  average: number | null;
  count: number;
};

export const toSummary = (p: ProductDetail): ProductSummary => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  category: p.category,
  pricePaise: p.pricePaise,
  originalPricePaise: p.originalPricePaise,
  onSale: p.onSale,
  image: p.images[0],
  deliveryDays: p.deliveryDays,
});
