"use client";

import { ArrowUpDown, ChevronDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  SORT_OPTIONS,
  countText,
  listingHref,
  type ListingFilters,
  type SortKey,
} from "../../lib/listing";

const SEARCH_DELAY_MS = 300;
const MAX_QUERY_LENGTH = 100;

type SearchBarProps = {
  filters: ListingFilters;
  /** Number of products shown in the grid. */
  count: number;
  /** Mobile Filters button (the bottom sheet trigger), shown beside Sort. */
  filtersButton: ReactNode;
};

/**
 * Desktop: one white bar with search icon, input, "N items" and Sort By.
 * Mobile: the search box full width, then Filters + Sort in a row below.
 */
export default function SearchBar({ filters, count, filtersButton }: SearchBarProps) {
  const router = useRouter();
  const [text, setText] = useState(filters.q);
  // Last search text this component sent to the URL.
  const [sent, setSent] = useState(filters.q);
  // When the URL changes from outside (back button, Clear All), show its text.
  const [seenQ, setSeenQ] = useState(filters.q);
  if (seenQ !== filters.q) {
    setSeenQ(filters.q);
    if (filters.q !== sent) {
      setSent(filters.q);
      setText(filters.q);
    }
  }

  const navigate = (q: string) => {
    setSent(q);
    const href = listingHref({ ...filters, q });
    // A new search gets its own history entry; refining it replaces that entry.
    if (filters.q === "") router.push(href, { scroll: false });
    else router.replace(href, { scroll: false });
  };

  // Update the URL after a short pause, so typing doesn't reload on every key.
  useEffect(() => {
    const q = text.trim().slice(0, MAX_QUERY_LENGTH);
    if (q === filters.q) return;
    const timer = setTimeout(() => navigate(q), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  });

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4 lg:rounded-card lg:border lg:border-line lg:bg-surface lg:py-2 lg:pr-2 lg:pl-4 lg:shadow-sm">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const q = text.trim().slice(0, MAX_QUERY_LENGTH);
          if (q !== filters.q) navigate(q);
        }}
        className="flex h-12 min-w-0 items-center gap-3 rounded-card border border-line bg-surface px-4 shadow-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-700 lg:h-11 lg:flex-1 lg:rounded-md lg:border-0 lg:px-1 lg:shadow-none"
      >
        <Search aria-hidden className="size-5 shrink-0 text-faint" />
        <label htmlFor="listing-search" className="sr-only">
          Search tools
        </label>
        <input
          id="listing-search"
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search tools…"
          maxLength={MAX_QUERY_LENGTH}
          autoComplete="off"
          enterKeyHint="search"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-text placeholder:text-faint focus:outline-none"
        />
        <span aria-live="polite" className="shrink-0 text-sm text-muted">
          {countText(count, "item", "items")}
        </span>
      </form>

      <div className="flex gap-3">
        {filtersButton}
        <SortSelect
          value={filters.sort}
          onChange={(sort) =>
            router.push(listingHref({ ...filters, sort }), { scroll: false })
          }
        />
      </div>
    </div>
  );
}

function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (value: SortKey) => void;
}) {
  return (
    <label className="relative flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-line bg-surface pl-3 shadow-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-700 lg:flex-none lg:border-faint/40 lg:shadow-none">
      <ArrowUpDown aria-hidden className="size-4 shrink-0 text-brand-950 lg:hidden" />
      <span className="hidden shrink-0 text-sm text-muted lg:inline">Sort By</span>
      <span className="sr-only lg:hidden">Sort By</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="h-full min-w-0 flex-1 cursor-pointer appearance-none truncate bg-transparent pr-8 text-sm font-medium lg:pr-9 lg:text-[15px] text-text focus:outline-none"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 size-4 text-text"
      />
    </label>
  );
}
