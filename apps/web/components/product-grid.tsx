"use client";

import { useState } from "react";
import { CATEGORIES } from "../lib/categories";
import type { BestSellerProduct } from "../lib/Products";
import CategoryChips, { type Chip } from "./category-chips";
import ProductCard from "./product-card";

// Same classes as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

const ALL = "all";
const CHIPS: Chip[] = [
  { label: "All Products", value: ALL },
  ...CATEGORIES.map((c) => ({ label: c.name, value: c.slug })),
];

type ProductGridProps = {
  title: string;
  products: BestSellerProduct[];
};

export default function ProductGrid({ title, products }: ProductGridProps) {
  const [selected, setSelected] = useState(ALL);
  const visible =
    selected === ALL
      ? products
      : products.filter((p) => p.category === selected);
  const headingId = "best-sellers-heading";

  return (
    <section aria-labelledby={headingId} className="py-6 lg:py-10">
      <div className={CONTAINER}>
        <div className="flex items-center justify-between gap-3 lg:mb-4">
          <h2
            id={headingId}
            className="text-2xl font-semibold text-text lg:text-[32px]"
          >
            {title}
          </h2>

          {/* Mobile: dropdown on the right of the heading (no sideways scroll). */}
          <div className="lg:hidden">
            <CategoryChips
              variant="select"
              label={`Filter ${title} by category`}
              chips={CHIPS}
              selected={selected}
              onSelect={setSelected}
            />
          </div>
        </div>

        {/* Desktop: chip row. */}
        <div className="hidden lg:block">
          <CategoryChips
            label={`Filter ${title} by category`}
            chips={CHIPS}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        <div aria-live="polite" className="mt-4 lg:mt-6">
          {visible.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-5 lg:gap-5">
              {visible.map((p, i) => (
                // id + index: stays unique even if two products share an id,
                // so React never re-uses the wrong card after filtering.
                <li key={`${p.id}-${i}`}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-card bg-well px-4 py-10 text-center text-body">
              No products in this category yet
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
