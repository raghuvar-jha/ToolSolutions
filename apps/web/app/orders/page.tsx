import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import SiteHeader from "../../components/Header";
import Footer from "../../components/footer";
import { requireUser } from "../../lib/auth/session";
import { formatPaise } from "../../lib/catalog/format";
import { getOrdersForUser } from "../../lib/orders/order-service";

export const metadata: Metadata = { title: "My Orders" };

// Same classes as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

type OrderSummary = Awaited<ReturnType<typeof getOrdersForUser>>[number];

const date = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const STATUS: Record<OrderSummary["status"], string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PAYMENT: Record<OrderSummary["paymentStatus"], string> = {
  pending: "Payment pending",
  demo: "Paid (demo)",
  paid: "Paid",
  failed: "Payment failed",
  refunded: "Refunded",
};

function statusText(o: OrderSummary) {
  const payment = o.paymentMethod === "cod" && o.paymentStatus === "pending" ? "Cash on Delivery" : PAYMENT[o.paymentStatus];
  return `${STATUS[o.status]} · ${payment}`;
}

/** The logged-in user's orders, newest first (spec 014). */
export default async function OrdersPage() {
  const user = await requireUser("/orders");
  const orders = await getOrdersForUser(user.id);

  return (
    <>
      <SiteHeader />
      <main className={`${CONTAINER} py-6 lg:py-10`}>
        <h1 className="text-2xl font-semibold text-text lg:text-[32px]">My Orders</h1>
        <p className="mt-1 text-[15px] text-muted">Orders placed with your account.</p>

        <div className="mt-6" aria-live="polite">
          {orders.length === 0 ? (
            <section className="rounded-card border border-line bg-surface px-4 py-12 text-center shadow-sm">
              <span className="mx-auto grid size-16 place-items-center rounded-pill bg-brand-50 text-brand-700">
                <Package aria-hidden className="size-8" />
              </span>
              <h2 className="mt-4 text-xl font-semibold text-text">No orders yet</h2>
              <Link
                href="/products"
                className={`mt-6 inline-flex h-12 items-center rounded-pill bg-brand-950 px-8 text-base font-semibold text-surface hover:bg-brand-900 ${FOCUS}`}
              >
                Browse products
              </Link>
            </section>
          ) : (
            <ul className="space-y-4">
              {orders.map((o) => {
                const itemCount = o.items.reduce((n, i) => n + i.quantity, 0);
                return (
                <li key={o.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-card border border-line bg-surface p-4 shadow-sm lg:p-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-text">{o.orderNumber}</p>
                    <p className="mt-0.5 text-sm text-muted">
                      {date.format(o.createdAt)} · {itemCount} {itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <p className="text-sm text-body">{statusText(o)}</p>
                  <p className="w-24 text-right font-semibold text-brand-950">{formatPaise(o.totalPaise)}</p>
                  <Link
                    href={`/orders/${o.id}`}
                    className={`inline-flex h-10 items-center rounded-pill border border-brand-950 px-4 text-sm font-semibold text-brand-950 hover:bg-brand-50 ${FOCUS}`}
                  >
                    View details<span className="sr-only"> of order {o.orderNumber}</span>
                  </Link>
                </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
