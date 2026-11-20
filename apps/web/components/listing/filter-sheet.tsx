"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { PRICE_MAX, listingHref, type ListingFilters } from "../../lib/listing";
import { CATEGORY_OPTIONS, FOCUS, PriceRange } from "./filter-sidebar";

/**
 * Mobile Filters button + bottom sheet (native modal <dialog>: Esc closes,
 * focus stays inside and returns to the button). Same sections as the
 * sidebar; nothing changes until Apply.
 */
export default function FilterSheet({ filters }: { filters: ListingFilters }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [category, setCategory] = useState(filters.category);
  const [max, setMax] = useState(filters.max ?? PRICE_MAX);

  const active = (filters.category ? 1 : 0) + (filters.max !== null ? 1 : 0);

  const open = () => {
    // Start from what the URL shows now.
    setCategory(filters.category);
    setMax(filters.max ?? PRICE_MAX);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  const apply = () => {
    router.push(
      listingHref({ ...filters, category, max: max >= PRICE_MAX ? null : max }),
      { scroll: false },
    );
    close();
  };

  const clearAll = () => {
    router.push("/products", { scroll: false });
    close();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-line bg-surface text-[15px] text-text shadow-sm lg:hidden ${FOCUS}`}
      >
        <SlidersHorizontal aria-hidden className="size-4 text-brand-950" />
        Filters
        {active > 0 && (
          <span className="grid size-5 place-items-center rounded-pill bg-brand-950 text-xs font-semibold text-surface">
            {active}
            <span className="sr-only"> active</span>
          </span>
        )}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="filter-sheet-title"
        // Tap on the dimmed backdrop closes the sheet.
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="m-0 mt-auto w-full max-w-none rounded-t-banner border-0 bg-surface p-0 text-text shadow-lg backdrop:bg-text/50 lg:hidden"
      >
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <h2 id="filter-sheet-title" className="text-lg font-semibold">
              Filters
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearAll}
                className={`rounded-sm px-2 py-1 text-sm font-semibold text-brand-950 ${FOCUS}`}
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={close}
                aria-label="Close filters"
                className={`grid size-10 place-items-center rounded-pill text-text hover:bg-well ${FOCUS}`}
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto px-4 py-4">
            <fieldset>
              <legend className="text-base font-semibold">Category</legend>
              <div className="mt-2 space-y-0.5">
                {CATEGORY_OPTIONS.map(({ name, slug }) => {
                  const checked = slug === category;
                  return (
                    <label
                      key={name}
                      className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 text-[15px] has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-brand-700 ${
                        checked ? "bg-brand-50 font-semibold text-brand-950" : "text-body"
                      }`}
                    >
                      <input
                        type="radio"
                        name="sheet-category"
                        checked={checked}
                        onChange={() => setCategory(slug)}
                        className="size-4 accent-brand-950"
                      />
                      {name}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-6">
              <PriceRange id="sheet-price" value={max} onChange={setMax} />
            </div>
          </div>

          <div className="border-t border-line px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={apply}
              className={`h-12 w-full rounded-pill bg-brand-950 text-base font-semibold text-surface hover:bg-brand-900 ${FOCUS}`}
            >
              Apply
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
