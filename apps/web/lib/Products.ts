/**
 * Static product data (spec 003). Temporary until the API / Prisma exist,
 * so keep UI code depending only on the `Product` type and the helpers below.
 *
 * Prices and the delivery badge are demo values copied from the design mock.
 */

export type ProductCollection = "popular" | "featured";

export type Product = {
  id: string;
  name: string;
  /** At least one image; the first one is shown on cards. */
  images: [string, ...string[]];
  /** Selling price in INR (whole rupees). */
  price: number;
  /** Maximum retail price in INR, shown struck through when higher than price. */
  mrp: number;
  /** Short delivery label shown as a badge, e.g. "1 Day". */
  deliveryBadge?: string;
  /** Homepage sections the product appears in. */
  collections: ProductCollection[];
};

// Only images that exist in apps/web/public/images/products.
const IMG = {
  annular: "/images/products/Annular.png",
  drill: "/images/products/Drill.png",
  micrometer: "/images/products/MicroMeter.png",
  grinder: "/images/products/AngleGrinder.png",
} as const;

export const Products: Product[] = [
  {
    id: "product-001",
    name: "Annular Cutter",
    images: [IMG.annular],
    price: 1299,
    mrp: 1599,
    deliveryBadge: "1 Day",
    collections: ["popular", "featured"],
  },
  {
    id: "product-002",
    name: "Power Drill",
    images: [IMG.drill],
    price: 1299,
    mrp: 1599,
    deliveryBadge: "1 Day",
    collections: ["popular", "featured"],
  },
  {
    id: "product-003",
    name: "Measuring Tool",
    images: [IMG.micrometer],
    price: 1299,
    mrp: 1599,
    deliveryBadge: "1 Day",
    collections: ["popular"],
  },
  {
    id: "product-004",
    name: "Angle Grinder",
    images: [IMG.grinder],
    price: 1299,
    mrp: 1599,
    deliveryBadge: "1 Day",
    collections: ["popular", "featured"],
  },
  {
    id: "product-005",
    name: "Digital Micrometer",
    images: [IMG.micrometer],
    price: 1299,
    mrp: 1599,
    deliveryBadge: "1 Day",
    collections: ["featured"],
  },
  {
    id: "product-006",
    name: "Industrial Drill",
    images: [IMG.drill],
    price: 1299,
    mrp: 1599,
    deliveryBadge: "1 Day",
    collections: ["featured"],
  },
  {
    id: "product-007",
    name: "Precision Micrometer",
    images: [IMG.micrometer],
    price: 1299,
    mrp: 1599,
    deliveryBadge: "1 Day",
    collections: ["featured"],
  },
  {
    id: "product-008",
    name: "Heavy Duty Grinder",
    images: [IMG.grinder],
    price: 1299,
    mrp: 1599,
    deliveryBadge: "1 Day",
    collections: ["featured"],
  },
  {
    id: "product-009",
    name: "Core Cutter",
    images: [IMG.annular],
    price: 1299,
    mrp: 1599,
    deliveryBadge: "1 Day",
    collections: ["featured"],
  },
  {
    id: "product-010",
    name: "Professional Drill",
    images: [IMG.drill],
    price: 1299,
    mrp: 1599,
    deliveryBadge: "1 Day",
    collections: ["featured"],
  },
 
];

/** Products in a homepage collection, in data order. */
export function getProductsIn(collection: ProductCollection): Product[] {
  return Products.filter((p) => p.collections.includes(collection));
}

/** URL of a product's detail page (route not built yet; 404 is expected). */
export function productHref(product: Pick<Product, "id">): string {
  return `/product/${encodeURIComponent(product.id)}`;
}

/* ------------------------------------------------------------------ */
/* Best Sellers (homepage section, spec 003). Demo prices in INR.      */
/* ------------------------------------------------------------------ */

export type BestSellerProduct = {
  name: string;
  slug: string;
  /** A category slug from lib/categories.ts. */
  category: string;
  /** Selling price in INR. */
  price: number;
  /** Price before the sale, in INR. Shown struck through when onSale. */
  originalPrice: number;
  onSale: boolean;
  image: string;
};

export const BEST_SELLERS: BestSellerProduct[] = [
  {
    name: "Annular Cutter",
    slug: "annular-cutter",
    category: "cutting-drilling",
    price: 1299,
    originalPrice: 1599,
    onSale: true,
    image: IMG.annular,
  },
  {
    name: "Power Drill",
    slug: "power-drill",
    category: "power-tools",
    price: 3499,
    originalPrice: 3999,
    onSale: true,
    image: IMG.drill,
  },
  {
    name: "Digital Micrometer",
    slug: "digital-micrometer",
    category: "measuring",
    price: 2199,
    originalPrice: 2199,
    onSale: false,
    image: IMG.micrometer,
  },
  {
    name: "Angle Grinder",
    slug: "angle-grinder",
    category: "power-tools",
    price: 2799,
    originalPrice: 3299,
    onSale: true,
    image: IMG.grinder,
  },
  {
    name: "Core Cutter",
    slug: "core-cutter",
    category: "cutting-drilling",
    price: 1899,
    originalPrice: 1899,
    onSale: false,
    image: IMG.annular,
  },
  {
    name: "Precision Micrometer",
    slug: "precision-micrometer",
    category: "measuring",
    price: 2599,
    originalPrice: 2999,
    onSale: true,
    image: IMG.micrometer,
  },
    {
    name: "Digital Micrometer",
    slug: "digital-micrometer",
    category: "measuring",
    price: 2199,
    originalPrice: 2199,
    onSale: false,
    image: IMG.micrometer,
  },
  {
    name: "Angle Grinder",
    slug: "angle-grinder",
    category: "power-tools",
    price: 2799,
    originalPrice: 3299,
    onSale: true,
    image: IMG.grinder,
  },
  {
    name: "Core Cutter",
    slug: "core-cutter",
    category: "cutting-drilling",
    price: 1899,
    originalPrice: 1899,
    onSale: false,
    image: IMG.annular,
  },
  {
    name: "Precision Micrometer",
    slug: "precision-micrometer",
    category: "measuring",
    price: 2599,
    originalPrice: 2999,
    onSale: true,
    image: IMG.micrometer,
  },
];

/** Product detail page URL (route not built yet; a 404 is expected). */
export const bestSellerHref = (slug: string) =>
  `/products/${encodeURIComponent(slug)}`;

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatInr = (value: number) => inr.format(value);

/* ------------------------------------------------------------------ */
/* Product detail page (spec 005). Placeholder data in INR.            */
/* Reviews below are placeholder content for development only.         */
/* ------------------------------------------------------------------ */

export type ProductVariant = {
  /** Option group shown above the chips, e.g. "Model" or "Size". */
  name: string;
  /** Chip text, e.g. "13 mm". */
  value: string;
  price: number;
  stock: number;
};

export type ProductSpec = { label: string; value: string };

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
  /** A category slug from lib/categories.ts. */
  category: string;
  brand: string;
  /** Base selling price in INR (the first variant's price when variants exist). */
  price: number;
  /** Real pre-sale price in INR; struck through only when higher than the current price. */
  originalPrice?: number;
  onSale: boolean;
  /** 1 to 4 images; the first is the main image. */
  images: [string, ...string[]];
  variants: ProductVariant[];
  /** Stock when the product has no variants. */
  stock: number;
  shortDescription: string;
  specs: ProductSpec[];
  inBox: string[];
  deliveryDays: number;
  warrantyText: string;
  returnPolicy: string;
  reviews: ProductReview[];
};

export const PRODUCT_DETAILS: ProductDetail[] = [
  {
    // Variants (one out of stock) + several reviews + 3 gallery images.
    id: "pd-001",
    name: "Power Drill",
    slug: "power-drill",
    category: "power-tools",
    brand: "Tools Solutions",
    price: 3499,
    originalPrice: 3999,
    onSale: true,
    // Only one photo exists; repeated as placeholder thumbnails.
    images: [IMG.drill, IMG.drill, IMG.drill],
    variants: [
      { name: "Model", value: "10 mm", price: 3499, stock: 12 },
      { name: "Model", value: "13 mm", price: 3999, stock: 5 },
      { name: "Model", value: "13 mm Hammer", price: 4599, stock: 0 },
    ],
    stock: 0,
    shortDescription:
      "Compact corded drill for wood, metal and light masonry. Variable speed trigger and reverse for driving and removing screws.",
    specs: [
      { label: "Model", value: "TS-PD10" },
      { label: "Power (W)", value: "600" },
      { label: "Speed (RPM)", value: "0–2800" },
      { label: "Weight (kg)", value: "1.6" },
      { label: "Material", value: "Glass-filled nylon body" },
      { label: "Warranty", value: "1 year" },
    ],
    inBox: ["1 × Drill", "1 × Side handle", "1 × Depth gauge", "1 × Carry case"],
    deliveryDays: 1,
    warrantyText: "1 year manufacturer warranty",
    returnPolicy: "7-day replacement for damaged or faulty items",
    reviews: [
      { id: "r-101", author: "Amit S.", rating: 5, date: "2026-10-02", text: "Strong motor for its size. Drilled through 12 mm steel plate without trouble." },
      { id: "r-102", author: "Neha K.", rating: 4, date: "2026-10-11", text: "Good grip and easy speed control. The carry case is a bit tight." },
      { id: "r-103", author: "Ravi P.", rating: 5, date: "2026-10-24", text: "Delivered next day as promised. Works well for daily site work." },
      { id: "r-104", author: "Sana M.", rating: 3, date: "2026-11-05", text: "Does the job, but gets warm after long use." },
    ],
  },
  {
    // Variants + no reviews + 3 gallery images. No "Material" spec (row must hide).
    id: "pd-002",
    name: "Angle Grinder",
    slug: "angle-grinder",
    category: "power-tools",
    brand: "Tools Solutions",
    price: 2799,
    originalPrice: 3299,
    onSale: true,
    images: [IMG.grinder, IMG.grinder, IMG.grinder],
    variants: [
      { name: "Size", value: "100 mm", price: 2799, stock: 8 },
      { name: "Size", value: "125 mm", price: 3299, stock: 3 },
    ],
    stock: 0,
    shortDescription:
      "Angle grinder for cutting, grinding and polishing metal. Slim body with a side handle for two-hand control.",
    specs: [
      { label: "Model", value: "TS-AG100" },
      { label: "Power (W)", value: "850" },
      { label: "Speed (RPM)", value: "11000" },
      { label: "Weight (kg)", value: "1.8" },
      { label: "Warranty", value: "6 months" },
    ],
    inBox: ["1 × Angle grinder", "1 × Side handle", "1 × Wheel guard", "1 × Spanner"],
    deliveryDays: 2,
    warrantyText: "6 months manufacturer warranty",
    returnPolicy: "7-day replacement for damaged or faulty items",
    reviews: [],
  },
  {
    // No variants + exactly 1 review (no pager) + single image (no thumbnails). No inBox.
    id: "pd-003",
    name: "Impact Drill",
    slug: "impact-drill",
    category: "power-tools",
    brand: "Tools Solutions",
    price: 4899,
    onSale: false,
    images: [IMG.drill],
    variants: [],
    stock: 6,
    shortDescription:
      "Hammer action drill for concrete and brick. Depth stop and a two-speed gearbox for controlled drilling.",
    specs: [
      { label: "Model", value: "TS-ID13" },
      { label: "Power (W)", value: "750" },
      { label: "Speed (RPM)", value: "0–3000" },
    ],
    inBox: [],
    deliveryDays: 3,
    warrantyText: "1 year manufacturer warranty",
    returnPolicy: "7-day replacement for damaged or faulty items",
    reviews: [
      { id: "r-301", author: "Karan D.", rating: 4, date: "2026-11-12", text: "Hammer mode makes quick work of brick walls. A little heavy for overhead work." },
    ],
  },
  {
    // No variants + several reviews + single image. Only category member (Similar hides).
    id: "pd-004",
    name: "Digital Micrometer",
    slug: "digital-micrometer",
    category: "measuring",
    brand: "Tools Solutions",
    price: 2199,
    originalPrice: 2499,
    onSale: true,
    images: [IMG.micrometer],
    variants: [],
    stock: 15,
    shortDescription:
      "Digital outside micrometer with a clear LCD and 0.001 mm resolution. Ratchet stop for consistent measuring force.",
    specs: [
      { label: "Model", value: "TS-DM25" },
      { label: "Range", value: "0–25 mm" },
      { label: "Resolution", value: "0.001 mm" },
      { label: "Material", value: "Hardened steel frame" },
      { label: "Warranty", value: "1 year" },
    ],
    inBox: ["1 × Micrometer", "1 × Storage case", "1 × Battery (SR44)"],
    deliveryDays: 1,
    warrantyText: "1 year manufacturer warranty",
    returnPolicy: "7-day replacement for damaged or faulty items",
    reviews: [
      { id: "r-401", author: "Priya N.", rating: 5, date: "2026-09-18", text: "Readings match our lab gauge. Display is easy to read." },
      { id: "r-402", author: "Vikram R.", rating: 4, date: "2026-10-07", text: "Accurate and well built. Battery cover could be firmer." },
      { id: "r-403", author: "Meera J.", rating: 5, date: "2026-11-01", text: "Smooth ratchet and zero drift so far. Good value." },
    ],
  },
];

export const getProductBySlug = (slug: string) =>
  PRODUCT_DETAILS.find((p) => p.slug === slug);

/** Up to `limit` products from the same category, excluding the product itself. */
export const getSimilarProducts = (product: ProductDetail, limit = 4) =>
  PRODUCT_DETAILS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).slice(0, limit);

/** Average of the real review ratings (one decimal), or null when there are none. */
export const averageRating = (reviews: ProductReview[]) =>
  reviews.length === 0
    ? null
    : Math.round(
        (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10,
      ) / 10;

/** Number of reviews per star value, index 0 = 5 stars … index 4 = 1 star. */
export const ratingCounts = (reviews: ProductReview[]) =>
  [5, 4, 3, 2, 1].map((star) => reviews.filter((r) => r.rating === star).length);

/** Shape the shared product card expects (Best Sellers card). */
export const toCardProduct = (p: ProductDetail): BestSellerProduct => ({
  name: p.name,
  slug: p.slug,
  category: p.category,
  price: p.price,
  originalPrice: p.originalPrice ?? p.price,
  onSale: p.onSale,
  image: p.images[0],
});
