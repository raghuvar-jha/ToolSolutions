"use client";

import Link from "next/link";
import { ChevronDown, Tag } from "lucide-react";
import { formatInr } from "../../lib/Products";
import { shippingQuote } from "../../lib/shipping";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

/** Same look as Buy Now on the product page. */
export const PRIMARY_BUTTON = `inline-flex h-12 w-full items-center justify-center rounded-pill bg-brand-950 text-base font-semibold text-surface hover:bg-brand-900 ${FOCUS}`;
export const OUTLINE_BUTTON = `inline-flex h-12 w-full items-center justify-center rounded-pill border border-brand-950 bg-surface text-base font-semibold text-brand-950 hover:bg-brand-50 ${FOCUS}`;

/** Checkout gets the cart from the same storage; it must re-price everything on the server. */
export const CHECKOUT_HREF = "/checkout";

type OrderSummaryProps = {
  itemCount: number;
  subtotal: number;
  gst: number;
  gstIncluded: boolean;
  total: number;
};

/**
 * Order Summary card (sticky on desktop) + the mobile sticky checkout bar.
 * The promo field is display-only in v1: no discount is calculated.
 */
export default function OrderSummary({ itemCount, subtotal, gst, gstIncluded, total }: OrderSummaryProps) {
  const shipping = shippingQuote(subtotal);

  return (
    <>
      <section
        aria-labelledby="summary-heading"
        className="rounded-card border border-line bg-surface shadow-sm lg:sticky lg:top-6"
      >
        <div className="p-4 lg:p-6">
          <h2 id="summary-heading" className="text-lg font-semibold text-text lg:text-xl">
            Order Summary
          </h2>

          {/* Display-only promo field (v1). */}
          <div title="Promo codes are coming soon" className="mt-4">
            <label
              htmlFor="promo-code"
              className="flex h-11 cursor-not-allowed items-center gap-2 rounded-md border border-line bg-well px-3 text-[15px] text-faint"
            >
              <Tag aria-hidden className="size-4 shrink-0" />
              <span className="sr-only">Promo code</span>
              <input
                id="promo-code"
                type="text"
                disabled
                placeholder="Have a promo code?"
                aria-describedby="promo-note"
                className="min-w-0 flex-1 cursor-not-allowed bg-transparent placeholder:text-faint"
              />
              <ChevronDown aria-hidden className="size-4 shrink-0" />
            </label>
            <p id="promo-note" className="mt-1 text-xs text-muted">
              Promo codes are coming soon.
            </p>
          </div>

          <dl className="mt-4 space-y-3 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">
                Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
              </dt>
              <dd className="font-semibold text-text">{formatInr(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Shipping</dt>
              <dd className={shipping.kind === "free" ? "font-semibold text-success" : "text-text"}>
                {shipping.kind === "free" ? "Free" : "Calculated at checkout"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">GST</dt>
              <dd className="text-text">{gstIncluded ? "Included in price" : formatInr(gst)}</dd>
            </div>
          </dl>
        </div>

        <div className="flex items-baseline justify-between gap-4 border-t border-line px-4 py-4 lg:px-6 lg:py-5">
          <span className="text-lg font-semibold text-text">Total</span>
          <span className="text-2xl font-semibold text-brand-950">{formatInr(total)}</span>
        </div>

        <div className="space-y-3 border-t border-line p-4 lg:p-6">
          {/* Mobile uses the sticky bar below instead. */}
          <Link href={CHECKOUT_HREF} className={`hidden lg:inline-flex ${PRIMARY_BUTTON}`}>
            Continue to checkout
          </Link>
          <Link href="/products" className={OUTLINE_BUTTON}>
            Continue Shopping
          </Link>
        </div>
      </section>

      {/* Mobile: checkout stays on screen, just above the tab bar (59px + 1px border). */}
      <div className="fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-30 border-t border-line bg-surface shadow-md lg:hidden">
        <div className="mx-auto flex w-full max-w-site items-center gap-4 px-4 py-3">
          <p className="shrink-0 leading-tight">
            <span className="block text-xs text-muted">Total</span>
            <span className="block text-lg font-semibold text-brand-950">{formatInr(total)}</span>
          </p>
          <Link href={CHECKOUT_HREF} className={PRIMARY_BUTTON}>
            Continue to checkout
          </Link>
        </div>
      </div>
    </>
  );
}
