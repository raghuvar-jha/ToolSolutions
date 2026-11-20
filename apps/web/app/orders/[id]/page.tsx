import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, CircleCheck, Clock, CreditCard, MapPin } from "lucide-react";
import SiteHeader from "../../../components/Header";
import Footer from "../../../components/footer";
import { orderRepository } from "../../../lib/orders/json-order-repository";
import type { Order } from "../../../lib/orders/order-repository";
import { formatInr, productPageHref } from "../../../lib/Products";

// Same classes as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

const CARD = "rounded-card border border-line bg-surface p-4 shadow-sm lg:p-6";

type PageProps = { params: Promise<{ id: string }> };

const longDate = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const PAYMENT_TEXT: Record<Order["payment"]["status"], string> = {
  pending: "Cash on Delivery · pay when your order arrives",
  demo: "Paid online (demo, no real payment)",
  created: "Online payment · awaiting payment",
  paid: "Paid online",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await orderRepository.findById(id);
  return { title: order ? `Order ${order.number}` : "Order not found" };
}

/** Order confirmation and detail (spec 009). The random order ID is the only key (v1 has no login). */
export default async function OrderPage({ params }: PageProps) {
  const { id } = await params;
  const order = await orderRepository.findById(id);

  return (
    <>
      <SiteHeader />
      <main className={`${CONTAINER} py-6 lg:py-10`}>
        {order ? <OrderDetail order={order} /> : <OrderNotFound />}
      </main>
      <Footer />
    </>
  );
}

function OrderDetail({ order }: { order: Order }) {
  const placed = order.status === "placed";
  const a = order.address;
  const count = order.lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <>
      <header className="flex flex-col items-center text-center">
        <span className="grid size-14 place-items-center rounded-pill bg-success-bg text-success">
          {placed ? <CircleCheck aria-hidden className="size-8" /> : <Clock aria-hidden className="size-8" />}
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-text lg:text-[32px]">
          {placed ? "Order placed" : "Payment pending"}
        </h1>
        <p className="mt-2 text-body">
          Order number <span className="font-semibold text-text">{order.number}</span>
        </p>
        <p className="mt-1 text-sm text-muted">Placed on {longDate.format(new Date(order.createdAt))}</p>
      </header>

      <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[56fr_37fr] lg:items-start lg:gap-16">
        <div className="space-y-6">
          <section aria-labelledby="items-heading" className={CARD}>
            <h2 id="items-heading" className="text-lg font-semibold text-text">
              Items ({count})
            </h2>
            <ul className="mt-2 divide-y divide-line">
              {order.lines.map((l) => (
                <li key={`${l.productId}:${l.variantId ?? ""}`} className="flex gap-4 py-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-card bg-well lg:size-20">
                    <Image src={l.image} alt={l.name} fill sizes="80px" className="object-contain p-2" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={productPageHref(l.productId)} className={`rounded-sm font-semibold text-text hover:text-brand-700 ${FOCUS}`}>
                      {l.name}
                    </Link>
                    {l.variantLabel && <p className="text-sm text-muted">{l.variantLabel}</p>}
                    <p className="mt-1 text-sm text-muted">
                      Qty {l.quantity} × {formatInr(l.unitPrice)}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-brand-950">{formatInr(l.lineTotal)}</p>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid gap-6 sm:grid-cols-2">
            <section aria-labelledby="address-heading" className={CARD}>
              <h2 id="address-heading" className="flex items-center gap-2 text-lg font-semibold text-text">
                <MapPin aria-hidden className="size-5 text-brand-700" />
                Delivery address
              </h2>
              <address className="mt-3 text-[15px] leading-relaxed text-body not-italic">
                <span className="font-semibold text-text">{a.fullName}</span>
                <br />
                {a.line1}
                {a.line2 && (
                  <>
                    <br />
                    {a.line2}
                  </>
                )}
                <br />
                {a.city}, {a.state} {a.pincode}
                <br />
                {a.mobile} · {a.email}
              </address>
              {a.instructions && <p className="mt-2 text-sm text-muted">Note: {a.instructions}</p>}
            </section>

            <section aria-labelledby="delivery-heading" className={CARD}>
              <h2 id="delivery-heading" className="flex items-center gap-2 text-lg font-semibold text-text">
                <CalendarDays aria-hidden className="size-5 text-brand-700" />
                Estimated delivery
              </h2>
              <p className="mt-3 text-[15px] font-semibold text-success">
                By {longDate.format(new Date(`${order.estimatedDelivery}T12:00:00+05:30`))}
              </p>
              <h2 className="mt-5 flex items-center gap-2 text-lg font-semibold text-text">
                <CreditCard aria-hidden className="size-5 text-brand-700" />
                Payment
              </h2>
              <p className="mt-3 text-[15px] text-body">{PAYMENT_TEXT[order.payment.status]}</p>
            </section>
          </div>
        </div>

        <section aria-labelledby="price-heading" className="rounded-card bg-well p-4 lg:p-6">
          <h2 id="price-heading" className="text-lg font-semibold text-text">
            Price Details ({count} {count === 1 ? "item" : "items"})
          </h2>
          <dl className="mt-3 space-y-2.5 text-[15px]">
            {order.lines.map((l) => (
              <div key={`${l.productId}:${l.variantId ?? ""}`} className="flex justify-between gap-4">
                <dt className="text-body">
                  {l.quantity} × {l.name}
                  {l.variantId ? ` (${l.variantId})` : ""}
                </dt>
                <dd className="shrink-0 text-text">{formatInr(l.lineTotal)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4">
              <dt className="text-body">Delivery Charges</dt>
              <dd className={order.deliveryLabel === "free" ? "font-semibold text-success" : "text-muted"}>
                {order.deliveryLabel === "free"
                  ? "Free Delivery"
                  : order.deliveryLabel === "charged"
                    ? formatInr(order.delivery)
                    : "To be confirmed"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-body">GST</dt>
              <dd className="text-text">{order.gstIncluded ? "Included in price" : formatInr(order.gst)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
            <span className="text-lg font-semibold text-text">Total Amount</span>
            <span className="text-lg font-semibold text-brand-950">{formatInr(order.total)}</span>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/products"
              className={`inline-flex h-12 items-center justify-center rounded-pill bg-brand-950 text-base font-semibold text-surface hover:bg-brand-900 ${FOCUS}`}
            >
              Continue Shopping
            </Link>
            <Link
              href="/orders"
              className={`inline-flex h-12 items-center justify-center rounded-pill border border-brand-950 bg-surface text-base font-semibold text-brand-950 hover:bg-brand-50 ${FOCUS}`}
            >
              View all orders
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

function OrderNotFound() {
  return (
    <section className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-2xl font-semibold text-text lg:text-[32px]">Order not found</h1>
      <p className="mt-3 text-body">Check the link, or find your order in the list.</p>
      <Link
        href="/orders"
        className={`mt-6 inline-flex h-12 items-center rounded-pill bg-brand-950 px-6 text-base font-semibold text-surface hover:bg-brand-900 ${FOCUS}`}
      >
        View my orders
      </Link>
    </section>
  );
}
