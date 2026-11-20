"use client";

import Image from "next/image";
import Link from "next/link";
import { CircleAlert, Heart, RotateCcw, Trash2, Truck } from "lucide-react";
import type { CartItem as CartItemData } from "../../lib/cart/cart-context";
import { bestSellerHref, formatInr } from "../../lib/Products";
import { DELIVERY_WINDOW_DAYS } from "../../lib/shipping";
import QuantityStepper from "./quantity-stepper";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

/** Stock warning shows at this level or below. */
const LOW_STOCK = 3;

const dayMonth = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });

/** "21–23 Nov" from today + deliveryDays (range width: lib/shipping.ts placeholder). */
function arrivalRange(deliveryDays: number) {
  const start = new Date();
  start.setDate(start.getDate() + deliveryDays);
  const end = new Date(start);
  end.setDate(end.getDate() + DELIVERY_WINDOW_DAYS);
  return dayMonth.formatRange(start, end);
}

type CartItemProps = {
  item: CartItemData;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
};

/**
 * One cart line: image, name, option, stock warning, delivery, returns,
 * line total, stepper, Save (display-only in v1) and remove.
 */
export default function CartItem({ item, onQuantity, onRemove }: CartItemProps) {
  const { product, variant, quantity, unitPrice, lineTotal, stock } = item;
  const href = bestSellerHref(product.slug);
  // Not in the data yet; the line stays hidden until it is.
  const returnDays = (product as { returnDays?: number }).returnDays;

  return (
    <article className="flex gap-4 rounded-card border border-line bg-surface p-4 shadow-sm lg:gap-6 lg:p-6">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className="relative size-24 shrink-0 overflow-hidden rounded-card bg-well lg:size-[120px]"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="120px"
          className="object-contain p-2"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-text lg:text-lg">
              <Link href={href} className={`rounded-sm hover:text-brand-700 ${FOCUS}`}>
                {product.name}
              </Link>
            </h2>
            {variant && (
              <p className="mt-0.5 text-sm text-muted">
                {variant.name} {variant.value}
              </p>
            )}
          </div>
          {/* Display-only in v1: there is no saved list yet. */}
          <button
            type="button"
            aria-disabled="true"
            title="Save for later is coming soon"
            onClick={(e) => e.preventDefault()}
            className={`flex shrink-0 cursor-not-allowed items-center gap-1.5 rounded-md px-1 py-0.5 text-sm text-body ${FOCUS}`}
          >
            <Heart aria-hidden className="size-4" />
            Save
            <span className="sr-only"> (coming soon)</span>
          </button>
        </div>

        {stock <= LOW_STOCK && (
          <p className="mt-3 flex items-center gap-2 rounded-md bg-star/15 px-3 py-2 text-sm font-medium text-text">
            <CircleAlert aria-hidden className="size-4 shrink-0" />
            Only {stock} left in stock
          </p>
        )}

        <ul className="mt-3 space-y-1 text-sm">
          <li className="flex items-center gap-2 text-success">
            <Truck aria-hidden className="size-4 shrink-0" />
            Arrives {arrivalRange(product.deliveryDays)}
          </li>
          {returnDays !== undefined && (
            <li className="flex items-center gap-2 text-muted">
              <RotateCcw aria-hidden className="size-4 shrink-0" />
              Free returns within {returnDays} days
            </li>
          )}
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="flex min-w-32 flex-wrap items-baseline gap-x-2">
            <span className="text-lg font-bold text-brand-950">{formatInr(lineTotal)}</span>
            {quantity > 1 && (
              <span className="text-sm text-muted">{formatInr(unitPrice)} each</span>
            )}
          </p>
          <QuantityStepper value={quantity} max={stock} onChange={onQuantity} label={product.name} />
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${product.name}${variant ? ` (${variant.value})` : ""}`}
            className={`ml-auto grid size-10 place-items-center rounded-pill text-body hover:bg-well hover:text-text ${FOCUS}`}
          >
            <Trash2 aria-hidden className="size-5" />
          </button>
        </div>
      </div>
    </article>
  );
}
