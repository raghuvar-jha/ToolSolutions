import Link from "next/link";
import type { ListingProduct } from "../../lib/listing";
import ProductCard from "../product-card";

type ProductGridProps = {
  products: ListingProduct[];
  /** Where "Clear filters" goes in the empty state. */
  clearHref: string;
};

/**
 * Listing grid: 2 columns on mobile (12px gaps), 5 at 1280px+ (16px gaps).
 * Uses the shared product card with the delivery line on.
 */
export default function ProductGrid({ products, clearHref }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-card border border-line bg-surface px-4 py-12 text-center shadow-sm">
        <p className="text-lg font-semibold text-text">
          No products match your filters
        </p>
        <Link
          href={clearHref}
          scroll={false}
          className="mt-5 inline-flex h-11 items-center rounded-pill bg-brand-950 px-6 text-[15px] font-semibold text-surface hover:bg-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5">
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} showSaleBadge={p.onSale} showDelivery />
        </li>
      ))}
    </ul>
  );
}
