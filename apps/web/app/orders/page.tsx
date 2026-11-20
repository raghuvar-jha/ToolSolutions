"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { useEffect, useState } from "react";
import SiteHeader from "../../components/Header";
import Footer from "../../components/footer";
import { BROWSER_ORDERS_KEY } from "../../lib/orders/order-repository";
import { formatInr } from "../../lib/Products";

// Same classes as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

type OrderSummary = {
  id: string;
  number: string;
  createdAt: string;
  total: number;
  status: "placed" | "pending_payment";
  paymentStatus: "pending" | "demo" | "created" | "paid";
  itemCount: number;
};

const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

function statusText(o: OrderSummary) {
  if (o.status === "pending_payment") return "Payment pending";
  if (o.paymentStatus === "pending") return "Placed · Cash on Delivery";
  if (o.paymentStatus === "demo") return "Placed · Paid (demo)";
  return "Placed · Paid";
}

function storedIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(BROWSER_ORDERS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Orders placed in this browser (spec 009, v1 has no login): the order IDs are
 * kept in localStorage and the details come from the server.
 */
export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ids = storedIds();
    const load = ids.length
      ? fetch(`/api/orders?ids=${encodeURIComponent(ids.join(","))}`, { cache: "no-store" })
          .then((r) => (r.ok ? (r.json() as Promise<{ orders: OrderSummary[] }>) : Promise.reject()))
          .then((d) => d.orders)
      : Promise.resolve<OrderSummary[]>([]);
    load
      .then((list) => !cancelled && setOrders(list))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <title>My Orders</title>
      <SiteHeader />
      <main className={`${CONTAINER} py-6 lg:py-10`}>
        <h1 className="text-2xl font-bold text-text lg:text-[32px]">My Orders</h1>
        <p className="mt-1 text-[15px] text-muted">Orders placed on this device.</p>

        <div className="mt-6" aria-live="polite">
          {failed ? (
            <p className="rounded-card border border-line bg-surface px-4 py-8 text-center text-body shadow-sm">
              Your orders couldn&apos;t be loaded. Please refresh the page.
            </p>
          ) : orders === null ? (
            <div aria-busy="true" aria-label="Loading orders" className="space-y-4">
              <div className="h-24 animate-pulse rounded-card bg-well motion-reduce:animate-none" />
              <div className="h-24 animate-pulse rounded-card bg-well motion-reduce:animate-none" />
            </div>
          ) : orders.length === 0 ? (
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
              {orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-card border border-line bg-surface p-4 shadow-sm lg:p-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-text">{o.number}</p>
                    <p className="mt-0.5 text-sm text-muted">
                      {date.format(new Date(o.createdAt))} · {o.itemCount} {o.itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-body">{statusText(o)}</p>
                  <p className="w-24 text-right font-bold text-brand-950">{formatInr(o.total)}</p>
                  <Link
                    href={`/orders/${o.id}`}
                    className={`inline-flex h-10 items-center rounded-pill border border-brand-950 px-4 text-sm font-semibold text-brand-950 hover:bg-brand-50 ${FOCUS}`}
                  >
                    View details<span className="sr-only"> of order {o.number}</span>
                  </Link>
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
