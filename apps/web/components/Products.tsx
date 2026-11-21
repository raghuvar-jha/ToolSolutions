"use client";

import Image from "next/image";
import Link from "next/link";
import { Truck } from "lucide-react";
import { useState } from "react";
import { formatPaise, productPageHref } from "../lib/catalog/format";
import type { ProductDetail } from "../lib/catalog/types";

// Same as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

const FOCUS_ON_LIGHT =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

/* ------------------------------------------------------------------ */
/* Add to cart (the navy bar under the price, DESIGN.md §5)            */
/* ------------------------------------------------------------------ */

function AddToCartButton({ productName }: { productName: string }) {
  // Local state only: no cart store exists yet (spec 003).
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={added}
      aria-label={
        added ? `${productName} added to cart` : `Add ${productName} to cart`
      }
      onClick={() => setAdded((v) => !v)}
      className={`group/cta relative z-10 mx-auto mt-2 grid h-6 w-14 place-items-center rounded-pill ${FOCUS_ON_LIGHT}`}
    >
      <span
        aria-hidden
        className={`block h-0.75 rounded-pill transition-all ${
          added
            ? "w-12 bg-success"
            : "w-8 bg-brand-950 group-hover/cta:w-12 group-focus-visible/cta:w-12"
        }`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Product card                                                        */
/* ------------------------------------------------------------------ */

function ProductCard({ product }: { product: ProductDetail }) {
  const mrp = product.originalPricePaise;
  const showMrp = mrp !== null && mrp > product.pricePaise;
  const deliveryBadge = product.deliveryDays ? `${product.deliveryDays} Day` : null;

  return (
    <article className="relative flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-sm transition-shadow hover:shadow-md has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-brand-700">
      <div className="relative aspect-square bg-well">
        <Image
          src={product.images[0]}
          alt=""
          fill
          sizes="(min-width: 1280px) 240px, (min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
          className="object-contain p-5 lg:p-6"
        />
        {deliveryBadge && (
          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-md bg-success-bg px-1.5 py-0.5 text-[11px] text-success uppercase">
            <Truck aria-hidden className="size-3.5" />
            <span className="sr-only">Delivery in</span>
            {deliveryBadge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center px-3 pt-3 pb-2 text-center lg:pt-4">
        <h3 className="w-full truncate text-[15px] font-semibold text-text">
          {/* Stretched link: the whole card opens the product page. */}
          <Link
            href={productPageHref(product.id)}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-3 flex items-baseline gap-1.5 lg:mt-4">
          <span className="sr-only">Price</span>
          <span className="text-lg font-semibold text-brand-950">
            {formatPaise(product.pricePaise)}
          </span>
          {showMrp && (
            <s className="text-[11px] text-faint">
              <span className="sr-only">MRP</span>
              {formatPaise(mrp!)}
            </s>
          )}
        </p>

        <AddToCartButton productName={product.name} />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */



function FeaturedProducts({ products }: { products: ProductDetail[] }) {
  return (
    <section
      aria-labelledby="featured-products"
      className="rounded-card border border-line bg-surface p-3 lg:p-4"
    >
      <h2
        id="featured-products"
        className="mb-3 text-lg font-semibold text-text lg:mb-4 lg:text-xl"
      >
        Featured Products
      </h2>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {products.map((p) => (
          <li key={p.id} className="grid">
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Not on the homepage yet. Pass getProductsInCollection("featured") from the repository. */
export function ProductSections({ featured }: { featured: ProductDetail[] }) {
  return (
    <div className={`${CONTAINER} space-y-4 py-4 lg:space-y-6 lg:py-6`}>

      <FeaturedProducts products={featured} />
    </div>
  );
}

export default ProductSections;
