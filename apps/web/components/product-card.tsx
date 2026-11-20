import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { deliveryText } from "../lib/listing";
import {
  bestSellerHref,
  formatInr,
  type BestSellerProduct,
} from "../lib/Products";

type ProductCardProps = {
  /** deliveryDays is optional: without it the delivery line is never shown. */
  product: BestSellerProduct & { deliveryDays?: number };
  /** "Sale" pill, still only for products that are on sale. Default: on. */
  showSaleBadge?: boolean;
  /** "✓ N Day Delivery" line (listing page). Default: off. */
  showDelivery?: boolean;
};

/** List card, layout per ProductsPage.png (DESIGN.md §5 "Product list page"). */
export default function ProductCard({
  product,
  showSaleBadge = true,
  showDelivery = false,
}: ProductCardProps) {
  const showOriginal =
    product.onSale && product.originalPrice > product.price;
  const delivery = showDelivery ? deliveryText(product.deliveryDays) : null;

  return (
    <article className="group relative flex h-full flex-col rounded-card bg-well p-2 transition duration-200 hover:-translate-y-1 hover:bg-surface hover:shadow-md has-[a:focus-visible]:-translate-y-1 has-[a:focus-visible]:bg-surface has-[a:focus-visible]:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:has-[a:focus-visible]:translate-y-0">
      <div className="relative aspect-square">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 50vw"
          className="object-contain p-4"
        />
        {showSaleBadge && product.onSale && (
          <span className="absolute top-2 left-2 rounded-pill bg-brand-950 px-2.5 py-1 text-xs font-semibold text-surface">
            Sale
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1.5 pt-3 pb-1">
        <h3 className="truncate text-[15px] font-medium text-text">
          {product.name}
        </h3>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
          <span className="sr-only">Price</span>
          <span className="text-sm font-bold text-brand-950">
            {formatInr(product.price)}
          </span>
          {showOriginal && (
            <s className="text-[13px] text-faint">
              <span className="sr-only">Original price</span>
              {formatInr(product.originalPrice)}
            </s>
          )}
        </p>
        {delivery && (
          <p className="mt-1 flex items-center gap-1 text-[13px] font-medium text-success">
            <Check aria-hidden className="size-3.5 shrink-0" />
            {delivery}
          </p>
        )}

        {/* Listing: cards in a row differ (delivery line or not), so push the button to the bottom. */}
        {showDelivery && <span aria-hidden className="block min-h-3 flex-1" />}

        {/* The button is the card's one link; ::after stretches it over the whole card. */}
        <Link
          href={bestSellerHref(product.slug)}
          aria-label={`View ${product.name}`}
          className={`${showDelivery ? "" : "mt-3 "}grid h-8 place-items-center rounded-md bg-surface text-sm font-medium text-text transition-colors after:absolute after:inset-0 after:rounded-card after:content-[''] group-hover:bg-brand-950 group-hover:text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 focus-visible:bg-brand-950 focus-visible:text-surface`}
        >
          View Product
        </Link>
      </div>
    </article>
  );
}
