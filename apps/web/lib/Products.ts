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
  {
    id: "product-011",
    name: "Steel Micrometer",
    images: [IMG.micrometer],
    price: 1299,
    mrp: 1599,
    deliveryBadge: "1 Day",
    collections: ["featured"],
  },
  {
    id: "product-012",
    name: "Industrial Grinder",
    images: [IMG.grinder],
    price: 1299,
    mrp: 1599,
    deliveryBadge: "1 Day",
    collections: ["featured"],
  },
  {
    id: "product-013",
    name: "Annular Core Cutter",
    images: [IMG.annular],
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
