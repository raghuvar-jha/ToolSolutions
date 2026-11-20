"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, Lock } from "lucide-react";
import { useState } from "react";
import type { CartItem } from "../../lib/cart/cart-context";
import { formatInr } from "../../lib/Products";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

/** Same look as Buy Now on the product page. */
export const PAY_BUTTON = `inline-flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-brand-950 text-base font-semibold text-surface hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`;

const dayMonthYear = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

function deliveryBy(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return dayMonthYear.format(d);
}

type CheckoutSummaryProps = {
  items: CartItem[];
  gst: number;
  gstIncluded: boolean;
  total: number;
  /** "free" when the confirmed shipping rule is met; otherwise the fee is still to be confirmed. */
  delivery: "free" | "pending";
  demo: boolean;
  submitting: boolean;
  canPay: boolean;
};

/**
 * Order Summary (right column): items read-only with an "Edit cart" link,
 * Price Details, Proceed to pay. Mobile: Price details collapse to one row;
 * the pay button lives in the sticky bar instead.
 */
export default function CheckoutSummary({
  items,
  gst,
  gstIncluded,
  total,
  delivery,
  demo,
  submitting,
  canPay,
}: CheckoutSummaryProps) {
  const [open, setOpen] = useState(false);
  const count = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <section aria-labelledby="summary-heading" className="lg:sticky lg:top-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="summary-heading" className="text-lg font-semibold text-text lg:text-xl">
          Order Summary
        </h2>
        <Link href="/cart" className={`rounded-sm text-sm font-medium text-brand-700 hover:underline ${FOCUS}`}>
          Edit cart
        </Link>
      </div>

      <ul className="mt-4 divide-y divide-line rounded-card border border-line bg-surface px-4 shadow-sm">
        {items.map((item) => (
          <li key={item.lineId} className="flex gap-4 py-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-card bg-well lg:size-24">
              <Image src={item.product.images[0]} alt={item.product.name} fill sizes="96px" className="object-contain p-2" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="font-semibold text-text">{item.product.name}</p>
              {item.variant && (
                <p className="text-sm text-muted">
                  {item.variant.name} {item.variant.value}
                </p>
              )}
              <p className="mt-1 text-sm text-muted">
                Estimated delivery by{" "}
                <span className="font-medium text-text">{deliveryBy(item.product.deliveryDays)}</span>
              </p>
              <div className="mt-auto flex items-baseline justify-between gap-3 pt-2">
                <span className="font-bold text-brand-950">{formatInr(item.unitPrice)}</span>
                <span className="text-sm text-muted">
                  Qty: <span className="font-semibold text-text">{item.quantity}</span>
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-card bg-well p-4 lg:p-5">
        {/* Mobile: one row with the total; tap to expand. Desktop: always open. */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="price-details"
          className={`flex w-full items-center justify-between gap-3 rounded-md text-left lg:hidden ${FOCUS}`}
        >
          <span className="font-semibold text-text">Price details</span>
          <span className="flex items-center gap-2 font-bold text-brand-950">
            {formatInr(total)}
            <ChevronDown aria-hidden className={`size-5 text-text transition-transform ${open ? "rotate-180" : ""}`} />
          </span>
        </button>

        <div id="price-details" className={`${open ? "mt-4 block" : "hidden"} lg:mt-0 lg:block`}>
          <h3 className="font-semibold text-text">
            Price Details ({count} {count === 1 ? "item" : "items"})
          </h3>
          <dl className="mt-3 space-y-2.5 text-[15px]">
            {items.map((item) => (
              <div key={item.lineId} className="flex justify-between gap-4">
                <dt className="min-w-0 text-body">
                  {item.quantity} × {item.product.name}
                  {item.variant ? ` (${item.variant.value})` : ""}
                </dt>
                <dd className="shrink-0 text-text">{formatInr(item.lineTotal)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4">
              <dt className="text-body">Delivery Charges</dt>
              <dd className={delivery === "free" ? "font-medium text-success" : "text-muted"}>
                {delivery === "free" ? "Free Delivery" : "To be confirmed"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-body">GST</dt>
              <dd className="text-text">{gstIncluded ? "Included in price" : formatInr(gst)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
            <span className="text-lg font-semibold text-text">Total Amount</span>
            <span className="text-lg font-bold text-brand-950">{formatInr(total)}</span>
          </div>
        </div>
      </div>

      {demo && (
        <p className="mt-3 text-center text-xs font-bold tracking-wide text-brand-700">
          DEMO MODE · no real payment is taken
        </p>
      )}

      <div className="mt-4 hidden lg:block">
        <button type="submit" disabled={submitting || !canPay} className={PAY_BUTTON}>
          {submitting ? "Placing order…" : "Proceed to pay"}
          {!submitting && <ArrowRight aria-hidden className="size-5" />}
        </button>
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted">
        <Lock aria-hidden className="size-4" />
        Secure checkout
      </p>
    </section>
  );
}
