"use client";

import Link from "next/link";
import { Info, X } from "lucide-react";
import { useCallback, useState } from "react";
import SiteHeader from "../../components/Header";
import Footer from "../../components/footer";
import CartItem from "../../components/cart/cart-item";
import EmptyCart from "../../components/cart/empty-cart";
import OrderSummary from "../../components/cart/order-summary";
import Recommendations from "../../components/cart/recommendations";
import UndoToast from "../../components/cart/undo-toast";
import { useCart, type CartLine } from "../../lib/cart/cart-context";

// Same classes as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

type Removed = { id: number; line: CartLine; index: number; name: string };

/**
 * Cart page (spec 008): items left, sticky Order Summary right, "You may also
 * like" below. Client-only content: the cart lives in localStorage, so the page
 * shows a placeholder until it has loaded.
 */
export default function CartPage() {
  const cart = useCart();
  const [removed, setRemoved] = useState<Removed | null>(null);
  const closeToast = useCallback(() => setRemoved(null), []);

  const remove = (lineId: string, name: string) => {
    const result = cart.removeItem(lineId);
    if (result) setRemoved({ id: Date.now(), ...result, name });
  };

  const undo = () => {
    if (removed) cart.restoreItem(removed.line, removed.index);
    setRemoved(null);
  };

  const hasItems = cart.loaded && cart.items.length > 0;

  return (
    <>
      <title>My Cart</title>
      <SiteHeader />
      <main className={`${CONTAINER} py-6 lg:py-10`}>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-text lg:text-[32px] lg:leading-tight">My Cart</h1>
          <Link
            href="/products"
            className={`rounded-sm text-[15px] font-medium text-text hover:text-brand-700 lg:text-base ${FOCUS}`}
          >
            Continue Shopping
          </Link>
        </div>

        {cart.removedUnavailable && (
          <p
            role="status"
            className="mt-4 flex items-center gap-3 rounded-card bg-brand-50 py-2 pr-2 pl-4 text-sm text-text"
          >
            <Info aria-hidden className="size-4 shrink-0 text-brand-700" />
            <span className="flex-1">Some items were removed because they are no longer available.</span>
            <button
              type="button"
              onClick={cart.dismissNotice}
              aria-label="Dismiss notice"
              className={`grid size-8 place-items-center rounded-md hover:bg-brand-100 ${FOCUS}`}
            >
              <X aria-hidden className="size-4" />
            </button>
          </p>
        )}

        <div className="mt-5 lg:mt-6">
          {!cart.loaded ? (
            // Hydration guard: same markup on server and first client render.
            <div aria-busy="true" aria-label="Loading your cart" className="space-y-4">
              <div className="h-40 animate-pulse rounded-card bg-well motion-reduce:animate-none" />
              <div className="h-40 animate-pulse rounded-card bg-well motion-reduce:animate-none" />
            </div>
          ) : hasItems ? (
            <div className="grid gap-6 lg:grid-cols-[61fr_39fr] lg:items-start">
              <ul className="space-y-4">
                {cart.items.map((item) => (
                  <li key={item.lineId}>
                    <CartItem
                      item={item}
                      onQuantity={(q) => cart.updateQuantity(item.lineId, q)}
                      onRemove={() => remove(item.lineId, item.product.name)}
                    />
                  </li>
                ))}
              </ul>
              <OrderSummary
                itemCount={cart.itemCount}
                subtotal={cart.subtotal}
                gst={cart.gst}
                gstIncluded={cart.gstIncluded}
                total={cart.total}
              />
            </div>
          ) : (
            <EmptyCart />
          )}
        </div>

        {cart.loaded && (
          <div className="mt-12 lg:mt-16">
            {/* Empty cart: still a discovery row, but not "You may also like". */}
            <Recommendations
              title={hasItems ? "You may also like" : "Popular tools"}
              excludeSlugs={cart.items.map((i) => i.product.slug)}
              categories={[...new Set(cart.items.map((i) => i.product.category))]}
            />
          </div>
        )}
      </main>
      <Footer />
      {/* Mobile: room for the sticky checkout bar so it never covers the footer. */}
      {hasItems && <div aria-hidden className="h-20 lg:hidden" />}

      {removed && (
        <UndoToast
          id={removed.id}
          message={`${removed.name} removed.`}
          onUndo={undo}
          onClose={closeToast}
        />
      )}
    </>
  );
}
