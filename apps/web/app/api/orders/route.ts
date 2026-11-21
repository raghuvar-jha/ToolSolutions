/**
 * Orders API (spec 009).
 *
 * POST  /api/orders            place an order (Idempotency-Key header required)
 * GET   /api/orders?ids=a,b    summaries for order IDs stored in this browser (v1, no login)
 * PATCH /api/orders            live mode: verify a Razorpay payment signature
 *
 * The browser sends only product IDs, variant IDs and quantities. Prices, stock,
 * GST, delivery and the total are recalculated here from lib/Products.ts.
 */



import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  fieldErrors,
  orderRequestSchema,
  paymentVerificationSchema,
  type OrderRequest,
} from "@repo/shared/checkout";
import { orderRepository } from "../../../lib/orders/json-order-repository";
import type { Order, OrderLine } from "../../../lib/orders/order-repository";
import { codAllowed, getPublicPaymentConfig, razorpayKeys } from "../../../lib/payments";
import { PRODUCT_DETAILS, formatInr, type ProductDetail } from "../../../lib/Products";
import { shippingQuote } from "../../../lib/shipping";

const IDEMPOTENCY_KEY = /^[A-Za-z0-9-]{16,64}$/;

type ApiError = { status: number; error: string; fields?: Partial<Record<string, string>> };

const fail = ({ status, ...body }: ApiError) => NextResponse.json(body, { status });

const unavailable = (name: string): ApiError => ({
  status: 409,
  error: `${name} is no longer available. Please update your cart.`,
});

/* Pricing (server-side source of truth) ------------------------------ */

function findItem(productId: string, variantId: string | null) {
  const product = PRODUCT_DETAILS.find((p) => p.id === productId);
  if (!product) return null;
  if (product.variants.length === 0) {
    return variantId === null ? { product, variant: null, price: product.price, stock: product.stock } : null;
  }
  const variant = product.variants.find((v) => v.value === variantId);
  return variant ? { product, variant, price: variant.price, stock: variant.stock } : null;
}

const gstRateOf = (product: ProductDetail) => {
  const rate = (product as ProductDetail & { gstRate?: number }).gstRate;
  return typeof rate === "number" && rate > 0 ? rate : null;
};

/** Stock already taken by earlier orders (the catalogue file itself is read-only). */
const reservedBy = (orders: readonly Order[], productId: string, variantId: string | null) =>
  orders
    .flatMap((o) => o.lines)
    .filter((l) => l.productId === productId && l.variantId === variantId)
    .reduce((n, l) => n + l.quantity, 0);

/** Merge repeated lines, so the same item can't slip past the stock check twice. */
function mergeLines(lines: OrderRequest["lines"]) {
  const merged = new Map<string, OrderRequest["lines"][number]>();
  for (const line of lines) {
    const key = `${line.productId}:${line.variantId ?? ""}`;
    const prev = merged.get(key);
    merged.set(key, prev ? { ...prev, quantity: prev.quantity + line.quantity } : { ...line });
  }
  return [...merged.values()];
}

type Priced = {
  lines: OrderLine[];
  subtotal: number;
  delivery: number;
  deliveryLabel: Order["deliveryLabel"];
  gst: number;
  gstIncluded: boolean;
  total: number;
  deliveryDays: number;
};

function price(request: OrderRequest, orders: readonly Order[]): Priced | ApiError {
  const lines: OrderLine[] = [];
  let gst = 0;
  let gstIncluded = true;
  let deliveryDays = 1;

  for (const line of mergeLines(request.lines)) {
    const item = findItem(line.productId, line.variantId);
    if (!item) return unavailable("An item in your cart");
    const name = item.variant ? `${item.product.name} (${item.variant.value})` : item.product.name;
    const available = item.stock - reservedBy(orders, line.productId, line.variantId);
    if (available <= 0) return unavailable(name);
    if (line.quantity > available) {
      return {
        status: 409,
        error: `Only ${available} of ${name} left in stock. Please update your cart.`,
      };
    }
    const lineTotal = item.price * line.quantity;
    const rate = gstRateOf(item.product);
    if (rate) {
      gst += Math.round((lineTotal * rate) / 100);
      gstIncluded = false;
    }
    deliveryDays = Math.max(deliveryDays, item.product.deliveryDays);
    lines.push({
      productId: line.productId,
      variantId: line.variantId,
      name: item.product.name,
      variantLabel: item.variant ? `${item.variant.name} ${item.variant.value}` : null,
      slug: item.product.slug,
      image: item.product.images[0],
      unitPrice: item.price,
      quantity: line.quantity,
      lineTotal,
    });
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  // Free only when the confirmed rule is met; otherwise ₹0 until the client sets a fee (lib/shipping.ts).
  const deliveryLabel = shippingQuote(subtotal).kind === "free" ? "free" : "pending";
  const delivery = 0;
  return {
    lines,
    subtotal,
    delivery,
    deliveryLabel,
    gst,
    gstIncluded,
    total: subtotal + delivery + (gstIncluded ? 0 : gst),
    deliveryDays,
  };
}

/* Helpers ------------------------------------------------------------ */

const istDate = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d); // yyyy-mm-dd

/** "TS-20261120-0001": per-day sequence (IST). */
function nextOrderNumber(orders: readonly Order[], now: Date) {
  const prefix = `TS-${istDate(now).replaceAll("-", "")}-`;
  const count = orders.filter((o) => o.number.startsWith(prefix)).length;
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

function addDays(d: Date, days: number) {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return istDate(out);
}

type RazorpayOrder = { id: string; amount: number; currency: string };

/** Live mode: create the matching Razorpay order (amount in paise). */
async function createRazorpayOrder(
  keys: { keyId: string; keySecret: string },
  order: Pick<Order, "id" | "number" | "total">,
): Promise<RazorpayOrder | null> {
  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keys.keyId}:${keys.keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: order.total * 100,
        currency: "INR",
        receipt: order.number,
        notes: { orderId: order.id },
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<RazorpayOrder>;
    return typeof data.id === "string" ? { id: data.id, amount: order.total * 100, currency: "INR" } : null;
  } catch {
    return null;
  }
}

/** What the browser needs after placing an order (no secrets). */
function placedResponse(order: Order, razorpayKeyId: string | null) {
  return {
    orderId: order.id,
    number: order.number,
    paymentStatus: order.payment.status,
    razorpay:
      order.status === "pending_payment" && order.payment.razorpayOrderId && razorpayKeyId
        ? {
            keyId: razorpayKeyId,
            orderId: order.payment.razorpayOrderId,
            amount: order.total * 100,
            currency: "INR",
            prefill: { name: order.address.fullName, email: order.address.email, contact: order.address.mobile },
          }
        : null,
  };
}

/* POST: place an order ----------------------------------------------- */

export async function POST(request: Request) {
  const key = request.headers.get("Idempotency-Key") ?? "";
  if (!IDEMPOTENCY_KEY.test(key)) return fail({ status: 400, error: "Missing or invalid Idempotency-Key header." });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail({ status: 400, error: "Invalid request." });
  }

  const parsed = orderRequestSchema.safeParse(body);
  if (!parsed.success) {
    return fail({ status: 400, error: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) });
  }
  const input = parsed.data;
  const config = getPublicPaymentConfig();
  const keys = config.mode === "live" ? razorpayKeys() : null;

  if (input.paymentMethod === "razorpay" && !config.razorpayAvailable) {
    return fail({ status: 400, error: "Online payment is unavailable right now. Please choose Cash on Delivery." });
  }

  type Outcome = { ok: true; order: Order; created: boolean } | { ok: false; error: ApiError };

  const outcome = await orderRepository.transact<Outcome>(async (orders) => {
    // Same key again (double click, retry): return the first order, create nothing.
    const existing = orders.find((o) => o.idempotencyKey === key);
    if (existing) return { result: { ok: true, order: existing, created: false } };

    const priced = price(input, orders);
    if ("error" in priced) return { result: { ok: false, error: priced } };

    if (input.paymentMethod === "cod" && !codAllowed(priced.total)) {
      return {
        result: {
          ok: false,
          error: {
            status: 400,
            error: `Cash on Delivery is available for orders up to ${formatInr(config.codMax)}. Please pay online.`,
          },
        },
      };
    }

    const now = new Date();
    const live = input.paymentMethod === "razorpay" && config.mode === "live";
    const order: Order = {
      id: randomUUID(),
      number: nextOrderNumber(orders, now),
      createdAt: now.toISOString(),
      status: live ? "pending_payment" : "placed",
      address: input.address,
      payment: {
        method: input.paymentMethod,
        // COD: collected on delivery. Demo: no real payment, marked "demo".
        status: input.paymentMethod === "cod" ? "pending" : live ? "created" : "demo",
      },
      lines: priced.lines,
      subtotal: priced.subtotal,
      delivery: priced.delivery,
      deliveryLabel: priced.deliveryLabel,
      gst: priced.gst,
      gstIncluded: priced.gstIncluded,
      total: priced.total,
      estimatedDelivery: addDays(now, priced.deliveryDays),
      idempotencyKey: key,
    };

    if (live) {
      const rzp = keys ? await createRazorpayOrder(keys, order) : null;
      if (!rzp) {
        return {
          result: {
            ok: false,
            error: { status: 502, error: "Online payment is unavailable right now. Please try again or choose Cash on Delivery." },
          },
        };
      }
      order.payment.razorpayOrderId = rzp.id;
    }

    // Saving the order also reserves its stock (see reservedBy).
    return { result: { ok: true, order, created: true }, save: order };
  });

  if (!outcome.ok) return fail(outcome.error);
  return NextResponse.json(placedResponse(outcome.order, keys?.keyId ?? null), {
    status: outcome.created ? 201 : 200,
  });
}

/* GET: order summaries for this browser ------------------------------ */

export async function GET(request: Request) {
  const ids = (new URL(request.url).searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[0-9a-f-]{36}$/.test(s))
    .slice(0, 50);
  if (ids.length === 0) return NextResponse.json({ orders: [] });

  const orders = await orderRepository.findByIds(ids);
  return NextResponse.json({
    orders: orders
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((o) => ({
        id: o.id,
        number: o.number,
        createdAt: o.createdAt,
        total: o.total,
        status: o.status,
        paymentStatus: o.payment.status,
        itemCount: o.lines.reduce((n, l) => n + l.quantity, 0),
      })),
  });
}

/* PATCH: live Razorpay payment verification -------------------------- */

export async function PATCH(request: Request) {
  const keys = getPublicPaymentConfig().mode === "live" ? razorpayKeys() : null;
  if (!keys) return fail({ status: 400, error: "Online payment is not enabled." });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail({ status: 400, error: "Invalid request." });
  }
  const parsed = paymentVerificationSchema.safeParse(body);
  if (!parsed.success) return fail({ status: 400, error: "Invalid payment details." });
  const v = parsed.data;

  // Razorpay signs "<order_id>|<payment_id>" with the key secret. Only this check confirms payment.
  const expected = createHmac("sha256", keys.keySecret)
    .update(`${v.razorpayOrderId}|${v.razorpayPaymentId}`)
    .digest();
  const given = Buffer.from(v.razorpaySignature, "hex");
  const valid = given.length === expected.length && timingSafeEqual(given, expected);

  const result = await orderRepository.transact<{ status: number; body: object }>((orders) => {
    const order = orders.find((o) => o.id === v.orderId);
    if (!order || order.payment.razorpayOrderId !== v.razorpayOrderId) {
      return { result: { status: 404, body: { error: "Order not found." } } };
    }
    if (order.payment.status === "paid") return { result: { status: 200, body: { orderId: order.id } } };
    if (!valid) return { result: { status: 400, body: { error: "Payment could not be verified." } } };
    const paid: Order = {
      ...order,
      status: "placed",
      payment: { ...order.payment, status: "paid", razorpayPaymentId: v.razorpayPaymentId },
    };
    return { result: { status: 200, body: { orderId: paid.id } }, save: paid };
  });

  return NextResponse.json(result.body, { status: result.status });
}

