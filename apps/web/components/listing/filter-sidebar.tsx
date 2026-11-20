"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "../../lib/categories";
import {
  PRICE_MAX,
  PRICE_MIN,
  PRICE_STEP,
  listingHref,
  type ListingFilters,
} from "../../lib/listing";
import { formatInr } from "../../lib/Products";

export const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

/** "All" + every category, for the sidebar and the mobile sheet. */
export const CATEGORY_OPTIONS = [
  { name: "All", slug: null },
  ...CATEGORIES.map((c) => ({ name: c.name, slug: c.slug as string | null })),
];

type PriceRangeProps = {
  id: string;
  value: number;
  onChange: (value: number) => void;
  /** Called when the slider is released (pointer up, key up, blur). */
  onCommit?: () => void;
};

/** "Maximum Price" slider with the ₹min / ₹max labels (used by the sidebar and sheet). */
export function PriceRange({ id, value, onChange, onCommit }: PriceRangeProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-base font-semibold text-text">
          Maximum Price
        </label>
        <span className="text-sm font-semibold text-brand-950">
          {formatInr(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={PRICE_STEP}
        value={value}
        aria-valuetext={`Up to ${formatInr(value)}`}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        onBlur={onCommit}
        className={`mt-4 h-2 w-full cursor-pointer accent-brand-950 ${FOCUS}`}
      />
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>{formatInr(PRICE_MIN)}</span>
        <span>{formatInr(PRICE_MAX)}</span>
      </div>
    </div>
  );
}

/**
 * Desktop filter card (hidden below lg): Clear All, category links, price
 * slider. Category is a link (instant); price applies when the slider is released.
 */
export default function FilterSidebar({ filters }: { filters: ListingFilters }) {
  const router = useRouter();
  const urlMax = filters.max ?? PRICE_MAX;
  const [value, setValue] = useState(urlMax);
  // Follow the URL (back button, Clear All) without remounting the slider.
  const [seenMax, setSeenMax] = useState(urlMax);
  if (seenMax !== urlMax) {
    setSeenMax(urlMax);
    setValue(urlMax);
  }

  const commit = () => {
    const max = value >= PRICE_MAX ? null : value;
    if (max !== filters.max) {
      router.push(listingHref({ ...filters, max }), { scroll: false });
    }
  };

  return (
    <aside
      aria-label="Filters"
      className="hidden rounded-card border border-line bg-surface p-5 shadow-sm lg:block"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-text">Filters</h2>
        <Link
          href="/products"
          scroll={false}
          className={`rounded-sm text-sm font-semibold text-brand-950 hover:underline ${FOCUS}`}
        >
          Clear All
        </Link>
      </div>

      <h3 className="mt-6 text-base font-semibold text-text">Category</h3>
      <ul className="mt-2 space-y-0.5">
        {CATEGORY_OPTIONS.map(({ name, slug }) => {
          const active = slug === filters.category;
          return (
            <li key={name}>
              <Link
                href={listingHref({ ...filters, category: slug })}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={`block rounded-md px-3 py-2 text-[15px] transition-colors ${FOCUS} ${
                  active
                    ? "bg-brand-50 font-semibold text-brand-950"
                    : "text-body hover:bg-well hover:text-text"
                }`}
              >
                {name}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-6">
        <PriceRange
          id="sidebar-price"
          value={value}
          onChange={setValue}
          onCommit={commit}
        />
      </div>
    </aside>
  );
}
