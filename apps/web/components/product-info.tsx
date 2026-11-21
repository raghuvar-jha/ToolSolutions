"use client";

import Link from "next/link";
import { ChevronDown, Minus, Plus, ShoppingCart } from "lucide-react";
import { useRef, useState } from "react";
import { useCart } from "../lib/cart/cart-context";
import { formatPaise } from "../lib/catalog/format";
import type { ProductDetail } from "../lib/catalog/types";
import ProductSpecs from "./product-specs";
import SaveButton from "./save-button";
import StickyBuyBar from "./sticky-buy-bar";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

/** Shared accordion look (native <details>: Enter / Space toggle it). */
const ACCORDION =
  "group rounded-card border border-faint/30 bg-surface [&_summary::-webkit-details-marker]:hidden";
const ACCORDION_SUMMARY = `flex cursor-pointer list-none items-center justify-between gap-4 rounded-card px-4 py-3 lg:px-5 lg:py-4 ${FOCUS}`;

/**
 * Right column of the product page: name, price, Description accordion,
 * option chips, quantity stepper, Add to Cart / Buy Now (+ mobile sticky bar).
 */
export default function ProductInfo({ product }: { product: ProductDetail }) {
  const { variants } = product;
  const firstInStock = Math.max(
    0,
    variants.findIndex((v) => v.stock > 0),
  );
  const [variantIndex, setVariantIndex] = useState(firstInStock);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState<string | null>(null);
  const { addItem } = useCart();
  const buttonsRef = useRef<HTMLDivElement>(null);

  const variant = variants[variantIndex];
  // Paise; formatted only for display.
  const price = variant?.pricePaise ?? product.pricePaise;
  const stock = variant?.stock ?? product.stock;
  const outOfStock = stock <= 0;
  const original =
    product.originalPricePaise && product.originalPricePaise > price
      ? product.originalPricePaise
      : null;
  const savings = original ? original - price : 0;

  const selectVariant = (i: number) => {
    setVariantIndex(i);
    setQty((q) => Math.min(Math.max(q, 1), Math.max(variants[i]!.stock, 1)));
    setAdded(null);
  };

  const buyParams = new URLSearchParams({ product: product.id, qty: String(qty) });
  if (variant) buyParams.set("option", variant.value);
  const buyHref = `/checkout?${buyParams.toString()}`;
  const itemLabel = variant ? `${product.name} (${variant.value})` : product.name;

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* 1. Name + save */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-text lg:text-[32px] lg:leading-tight">
          {product.name}
        </h1>
        <SaveButton productId={product.id} productName={product.name} variant="page" />
      </div>

      {/* 2. Price */}
      <div className="-mt-2 lg:-mt-3">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="sr-only">Price</span>
          <span className="text-[28px] font-semibold text-brand-950 lg:text-[32px]">
            {formatPaise(price)}
          </span>
          {original && (
            <s className="text-base text-faint">
              <span className="sr-only">Original price</span>
              {formatPaise(original)}
            </s>
          )}
        </p>
        {savings > 0 && (
          <p className="mt-1 text-sm font-semibold text-success">
            You save {formatPaise(savings)} (
            {Math.round((savings / original!) * 100)}% off)
          </p>
        )}
      </div>

      {/* 3. Description accordion */}
      <details open className={ACCORDION}>
        <summary className={ACCORDION_SUMMARY}>
          <h2 className="text-base font-semibold text-text">Description</h2>
          <ChevronDown
            aria-hidden
            className="size-5 shrink-0 text-text transition-transform group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <div className="px-4 pb-4 lg:px-5 lg:pb-5">
          <p className="text-[15px] leading-relaxed text-body">
            {product.shortDescription}
          </p>
          <ProductSpecs specs={product.specs} inBox={product.inBox} />
        </div>
      </details>

      {/* 4. Options */}
      {variants.length > 0 && (
        <fieldset>
          <legend className="text-sm text-text">
            {variants[0]!.name}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((v, i) => {
              const active = i === variantIndex;
              const soldOut = v.stock <= 0;
              return (
                <button
                  key={v.value}
                  type="button"
                  disabled={soldOut}
                  aria-pressed={active}
                  onClick={() => selectVariant(i)}
                  className={`flex min-h-10 flex-col items-center justify-center rounded-md border px-4 py-1 text-sm transition-colors ${FOCUS} ${
                    soldOut
                      ? "cursor-not-allowed border-line bg-well text-faint"
                      : active
                        ? "border-brand-950 bg-brand-950 font-semibold text-surface"
                        : "border-faint/40 bg-surface text-text hover:border-brand-950"
                  }`}
                >
                  <span className={soldOut ? "line-through" : undefined}>{v.value}</span>
                  {soldOut && <span className="text-[11px] leading-tight">Out of stock</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Stock message */}
      <p className={`text-sm ${outOfStock ? "text-muted" : "text-success"}`}>
        {outOfStock
          ? "Out of stock"
          : stock <= 5
            ? `Only ${stock} left in stock`
            : "In stock"}
      </p>

      {/* 5. Quantity */}
      <div className="-mt-2 flex items-center gap-3">
        <span id="qty-label" className="text-sm text-text">
          Quantity
        </span>
        <div role="group" aria-labelledby="qty-label" className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={outOfStock || qty <= 1}
            aria-label="Decrease quantity"
            className={`grid size-9 place-items-center bg-brand-950 text-surface disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`}
          >
            <Minus aria-hidden className="size-4" />
          </button>
          <output aria-live="polite" className="min-w-6 text-center text-base font-semibold text-text">
            {qty}
          </output>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(stock, q + 1))}
            disabled={outOfStock || qty >= stock}
            aria-label="Increase quantity"
            className={`grid size-9 place-items-center bg-brand-950 text-surface disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`}
          >
            <Plus aria-hidden className="size-4" />
          </button>
        </div>
        {!outOfStock && qty >= stock && (
          <span className="text-xs text-muted">Max {stock}</span>
        )}
      </div>

      {/* 6. Buttons: Buy Now first in the DOM (on top on mobile), Add to Cart left on desktop. */}
      <div ref={buttonsRef} className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-4">
        {outOfStock ? (
          <span className="inline-flex h-12 items-center justify-center rounded-pill bg-brand-950/40 text-base font-semibold text-surface lg:order-2">
            Out of stock
          </span>
        ) : (
          <Link
            href={buyHref}
            className={`inline-flex h-12 items-center justify-center rounded-pill bg-brand-950 text-base font-semibold text-surface hover:bg-brand-900 lg:order-2 ${FOCUS}`}
          >
            Buy Now
          </Link>
        )}
        <button
          type="button"
          disabled={outOfStock}
          onClick={() => {
            // Same variant again: the cart raises its quantity, capped at the stock.
            const { added: n, inCart } = addItem(product.id, variant?.value ?? null, qty);
            setAdded(
              n === 0
                ? `Your cart already has the maximum available (${inCart}) of ${itemLabel}.`
                : n < qty
                  ? `Added ${n} × ${itemLabel}. Your cart now has all ${inCart} in stock.`
                  : `Added ${n} × ${itemLabel} to your cart.`,
            );
          }}
          className={`inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-brand-950 bg-surface text-base font-semibold text-brand-950 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40 lg:order-1 ${FOCUS}`}
        >
          <ShoppingCart aria-hidden className="size-5" />
          Add to Cart
        </button>
      </div>
      <p role="status" className="-mt-2 min-h-5 text-sm text-success">
        {added}
        {added && (
          <>
            {" "}
            <Link
              href="/cart"
              className={`rounded-sm text-brand-700 underline underline-offset-2 hover:text-brand-950 ${FOCUS}`}
            >
              View cart
            </Link>
          </>
        )}
      </p>

      <StickyBuyBar
        targetRef={buttonsRef}
        price={formatPaise(price)}
        detail={variant ? `${variant.name}: ${variant.value} · Qty ${qty}` : `Qty ${qty}`}
        buyHref={buyHref}
        disabled={outOfStock}
      />
    </div>
  );
}
