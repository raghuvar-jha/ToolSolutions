import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, CircleCheck, Clock, CreditCard, MapPin } from "lucide-react";
import SiteHeader from "../../../components/Header";
import Footer from "../../../components/footer";
import { getCurrentUser, requireUser } from "../../../lib/auth/session";
import { formatPaise, productPageHref } from "../../../lib/catalog/format";
import { getOrderForUser, type OrderWithItems } from "../../../lib/orders/order-service";

type Order = OrderWithItems;

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

function paymentText(order: Order): string {
  switch (order.paymentStatus) {
    case "pending":
      return order.paymentMethod === "cod"
        ? "Cash on Delivery · pay when your order arrives"
        : "Online payment · awaiting payment";
    case "demo":
      return "Paid online (demo, no real payment)";
    case "paid":
      return "Paid online";
    case "failed":
      return "Payment failed";
    case "refunded":
      return "Refunded";
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return { title: "Order" };
  const order = await getOrderForUser(user.id, id);
  return { title: order ? `Order ${order.orderNumber}` : "Order not found" };
}

/**
 * Order confirmation and detail (specs 009 and 014). Shown only to the order's owner;
 * anyone else sees "Order not found", so other users' orders are never revealed.
 */
export default async function OrderPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireUser(`/orders/${encodeURIComponent(id)}`);
  const order = await getOrderForUser(user.id, id);

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
  // Live online orders stay "awaiting payment" until the server verifies Razorpay's signature.
  const placed = !(order.paymentMethod === "razorpay" && order.paymentStatus === "pending");
  const a = order;
  const count = order.items.reduce((n, l) => n + l.quantity, 0);

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
          Order number <span className="font-semibold text-text">{order.orderNumber}</span>
        </p>
        <p className="mt-1 text-sm text-muted">Placed on {longDate.format(order.createdAt)}</p>
      </header>

      <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[56fr_37fr] lg:items-start lg:gap-16">
        <div className="space-y-6">
          <section aria-labelledby="items-heading" className={CARD}>
            <h2 id="items-heading" className="text-lg font-semibold text-text">
              Items ({count})
            </h2>
            <ul className="mt-2 divide-y divide-line">
              {order.items.map((l) => (
                <li key={l.id} className="flex gap-4 py-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-card bg-well lg:size-20">
                    {l.imageSnapshot && (
                      <Image src={l.imageSnapshot} alt={l.productNameSnapshot} fill sizes="80px" className="object-contain p-2" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={productPageHref(l.productId)} className={`rounded-sm font-semibold text-text hover:text-brand-700 ${FOCUS}`}>
                      {l.productNameSnapshot}
                    </Link>
                    {l.variantNameSnapshot && <p className="text-sm text-muted">{l.variantNameSnapshot}</p>}
                    <p className="mt-1 text-sm text-muted">
                      Qty {l.quantity} × {formatPaise(l.unitPricePaise)}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-brand-950">{formatPaise(l.lineTotalPaise)}</p>
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
                {a.phone} · {a.email}
              </address>
              {a.instructions && <p className="mt-2 text-sm text-muted">Note: {a.instructions}</p>}
            </section>

            <section aria-labelledby="delivery-heading" className={CARD}>
              <h2 id="delivery-heading" className="flex items-center gap-2 text-lg font-semibold text-text">
                <CalendarDays aria-hidden className="size-5 text-brand-700" />
                Estimated delivery
              </h2>
              <p className="mt-3 text-[15px] font-semibold text-success">
                By {longDate.format(order.estimatedDelivery)}
              </p>
              <h2 className="mt-5 flex items-center gap-2 text-lg font-semibold text-text">
                <CreditCard aria-hidden className="size-5 text-brand-700" />
                Payment
              </h2>
              <p className="mt-3 text-[15px] text-body">{paymentText(order)}</p>
            </section>
          </div>
        </div>

        <section aria-labelledby="price-heading" className="rounded-card bg-well p-4 lg:p-6">
          <h2 id="price-heading" className="text-lg font-semibold text-text">
            Price Details ({count} {count === 1 ? "item" : "items"})
          </h2>
          <dl className="mt-3 space-y-2.5 text-[15px]">
            {order.items.map((l) => (
              <div key={l.id} className="flex justify-between gap-4">
                <dt className="text-body">
                  {l.quantity} × {l.productNameSnapshot}
                  {l.variantNameSnapshot ? ` (${l.variantNameSnapshot})` : ""}
                </dt>
                <dd className="shrink-0 text-text">{formatPaise(l.lineTotalPaise)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4">
              <dt className="text-body">Delivery Charges</dt>
              {/* Delivery fees aren't set yet (lib/shipping.ts), so ₹0 means "to be confirmed". */}
              <dd className={order.deliveryPaise > 0 ? "text-text" : "text-muted"}>
                {order.deliveryPaise > 0 ? formatPaise(order.deliveryPaise) : "To be confirmed"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-body">GST</dt>
              <dd className="text-text">{order.gstPaise === 0 ? "Included in price" : formatPaise(order.gstPaise)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
            <span className="text-lg font-semibold text-text">Total Amount</span>
            <span className="text-lg font-semibold text-brand-950">{formatPaise(order.totalPaise)}</span>
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
