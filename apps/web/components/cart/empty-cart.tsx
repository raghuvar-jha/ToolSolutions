import Link from "next/link";
import { ShoppingCart } from "lucide-react";

/** Shown when the cart has no items (no summary, no "You may also like" heading). */
export default function EmptyCart() {
  return (
    <section className="rounded-card border border-line bg-surface px-4 py-12 text-center shadow-sm lg:py-16">
      <span className="mx-auto grid size-16 place-items-center rounded-pill bg-brand-50 text-brand-700">
        <ShoppingCart aria-hidden className="size-8" />
      </span>
      <h2 className="mt-4 text-xl font-semibold text-text lg:text-2xl">Your cart is empty</h2>
      <p className="mt-2 text-body">Browse our tools and add what you need.</p>
      <Link
        href="/products"
        className="mt-6 inline-flex h-12 items-center rounded-pill bg-brand-950 px-8 text-base font-semibold text-surface hover:bg-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
      >
        Continue Shopping
      </Link>
    </section>
  );
}
