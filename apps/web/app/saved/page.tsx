"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import SiteHeader from "../../components/Header";
import Footer from "../../components/footer";
import ProductCard from "../../components/product-card";
import { countText, LISTING_PRODUCTS } from "../../lib/listing";
import { useSaved } from "../../lib/saved/saved-context";

// Same classes as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

const BY_ID = new Map(LISTING_PRODUCTS.map((p) => [p.id, p]));

/**
 * Saved items: the products the shopper hearted, newest first, in the
 * listing grid. The list lives in localStorage, so the page shows a
 * placeholder until it has loaded. Tapping a card's heart removes it.
 */
export default function SavedPage() {
  const { ids, loaded } = useSaved();
  const products = ids.flatMap((id) => BY_ID.get(id) ?? []);

  return (
    <>
      <title>Saved items</title>
      <SiteHeader />
      <main className={`${CONTAINER} py-6 lg:py-10`}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="text-2xl font-semibold text-text lg:text-[32px] lg:leading-tight">
            Saved items
          </h1>
          {loaded && products.length > 0 && (
            <p className="text-[15px] text-muted">
              {countText(products.length, "item", "items")}
            </p>
          )}
        </div>

        <div className="mt-5 lg:mt-6">
          {!loaded ? (
            // Hydration guard: same markup on server and first client render.
            <div aria-busy="true" className="h-64 rounded-card bg-well" />
          ) : products.length === 0 ? (
            <section className="rounded-card border border-line bg-surface px-4 py-12 text-center shadow-sm lg:py-16">
              <span className="mx-auto grid size-16 place-items-center rounded-pill bg-brand-50 text-brand-700">
                <Heart aria-hidden className="size-8" />
              </span>
              <h2 className="mt-4 text-xl font-semibold text-text lg:text-2xl">No saved items yet</h2>
              <p className="mt-2 text-body">Tap the heart on any tool to save it for later.</p>
              <Link
                href="/products"
                className={`mt-6 inline-flex h-12 items-center rounded-pill bg-brand-950 px-8 text-base font-semibold text-surface hover:bg-brand-900 ${FOCUS}`}
              >
                Browse tools
              </Link>
            </section>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5">
              {products.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} showSaleBadge={p.onSale} showDelivery />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
