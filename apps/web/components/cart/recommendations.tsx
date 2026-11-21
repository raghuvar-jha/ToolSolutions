"use client";

import { useCatalog } from "../../lib/catalog/catalog-context";
import ProductCard from "../product-card";

const LIMIT = 5;

type RecommendationsProps = {
  title: string;
  /** Product IDs already in the cart (never recommended). */
  excludeIds: string[];
  /** Categories of the cart items; their products come first. */
  categories: string[];
};

/**
 * Up to 5 products: same categories as the cart first, then others; cart
 * items excluded. Desktop: one 5-column row. Mobile: a horizontal scroll row.
 * Hidden when nothing is left to show.
 */
export default function Recommendations({ title, excludeIds, categories }: RecommendationsProps) {
  const { summaries } = useCatalog();
  const pool = summaries.filter((p) => !excludeIds.includes(p.id));
  const picks = [
    ...pool.filter((p) => categories.includes(p.category)),
    ...pool.filter((p) => !categories.includes(p.category)),
  ].slice(0, LIMIT);
  if (picks.length === 0) return null;

  return (
    <section aria-labelledby="recommendations-heading">
      <h2
        id="recommendations-heading"
        className="text-2xl font-semibold text-text lg:text-[24px]"
      >
        {title}
      </h2>
      <ul className="-mx-4 mt-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-3 lg:mx-0 lg:mt-6 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0">
        {picks.map((p) => (
          <li key={p.id} className="w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-auto">
            <ProductCard product={p} showSaleBadge={p.onSale} showDelivery />
          </li>
        ))}
      </ul>
    </section>
  );
}
