/**
 * Orders (specs 009 and 014). Server only.
 *
 * - Every price, GST amount and total is recalculated here from the database.
 *   The browser sends only product ids, variant values and quantities.
 * - The order, its items, the stock reduction and the order number are written
 *   in one transaction. Stock only goes down when enough is left, so two buyers
 *   can't both get the last item.
 * - The same Idempotency-Key returns the existing order instead of a new one.
 * - Every read and write is scoped to the logged-in user's id.
 */
import type { OrderRequest } from "@repo/shared/checkout";
import { Prisma, type Order, type OrderItem } from "../../generated/prisma/client";
import { formatInr } from "../catalog/format";
import { db } from "../db";
import { codAllowed, getPublicPaymentConfig, razorpayKeys } from "../payments";
import { DEFAULT_DELIVERY_DAYS } from "../shipping";

export type OrderWithItems = Order & { items: OrderItem[] };

export type PlaceOrderResult =
  | { ok: true; order: OrderWithItems; created: boolean; razorpay: RazorpayHandoff | null }
  | { ok: false; status: number; error: string };

export type RazorpayHandoff = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: "INR";
  prefill: { name: string; email: string; contact: string };
};

/** Thrown inside the transaction to roll it back with a message for the shopper. */
class OrderRejected extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const unavailable = (name: string) =>
  new OrderRejected(409, `${name} is no longer available. Please update your cart.`);

/* Helpers ------------------------------------------------------------ */

const istDay = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d).replaceAll("-", ""); // 20261120

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

const isUniqueViolation = (error: unknown, field: string) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002" &&
  JSON.stringify(error.meta ?? {}).includes(field);

/** The existing order for this key, if it belongs to this user. */
async function findByKey(userId: string, idempotencyKey: string) {
  const order = await db().order.findUnique({ where: { idempotencyKey }, include: { items: true } });
  if (!order) return null;
  return order.userId === userId ? order : "other-user";
}

/* Place an order ----------------------------------------------------- */

export async function placeOrder(input: {
  userId: string;
  idempotencyKey: string;
  request: OrderRequest;
}): Promise<PlaceOrderResult> {
  const { userId, idempotencyKey, request } = input;

  // Same key again (double click, retry): return the first order, create nothing.
  const existing = await findByKey(userId, idempotencyKey);
  if (existing === "other-user") return { ok: false, status: 409, error: "This request was already used. Please try again." };
  if (existing) return { ok: true, order: existing, created: false, razorpay: handoff(existing) };

  const config = getPublicPaymentConfig();
  if (request.paymentMethod === "razorpay" && !config.razorpayAvailable) {
    return { ok: false, status: 400, error: "Online payment is unavailable right now. Please choose Cash on Delivery." };
  }
  const live = request.paymentMethod === "razorpay" && config.mode === "live";

  let order: OrderWithItems;
  try {
    order = await db().$transaction(
      async (tx) => {
        const lines = mergeLines(request.lines);
        const products = await tx.product.findMany({
          where: { id: { in: lines.map((l) => l.productId) }, isActive: true },
          include: { variants: true },
        });

        let subtotalPaise = 0;
        let gstPaise = 0;
        let deliveryDays = DEFAULT_DELIVERY_DAYS;
        const items: Prisma.OrderItemCreateWithoutOrderInput[] = [];

        for (const line of lines) {
          const product = products.find((p) => p.id === line.productId);
          if (!product) throw unavailable("An item in your cart");
          const variant =
            line.variantId === null ? null : (product.variants.find((v) => v.value === line.variantId) ?? null);
          // Products with variants need one; products without must not get one.
          if ((product.variants.length > 0) !== (variant !== null)) throw unavailable(product.name);

          const name = variant ? `${product.name} (${variant.value})` : product.name;
          const stock = variant ? variant.stock : product.stock;
          if (stock <= 0) throw unavailable(name);
          if (line.quantity > stock) {
            throw new OrderRejected(409, `Only ${stock} of ${name} left in stock. Please update your cart.`);
          }

          const unitPricePaise = variant?.pricePaise ?? product.pricePaise;
          const lineTotalPaise = unitPricePaise * line.quantity;
          const gstRateBps = product.gstRateBps && product.gstRateBps > 0 ? product.gstRateBps : null;
          if (gstRateBps) gstPaise += Math.round((lineTotalPaise * gstRateBps) / 10_000);
          subtotalPaise += lineTotalPaise;
          deliveryDays = Math.max(deliveryDays, product.deliveryDays ?? DEFAULT_DELIVERY_DAYS);

          // Reduce stock only if enough is still left (another order may have just taken it).
          const taken = variant
            ? await tx.productVariant.updateMany({
                where: { id: variant.id, stock: { gte: line.quantity } },
                data: { stock: { decrement: line.quantity } },
              })
            : await tx.product.updateMany({
                where: { id: product.id, stock: { gte: line.quantity } },
                data: { stock: { decrement: line.quantity } },
              });
          if (taken.count !== 1) throw unavailable(name);

          items.push({
            product: { connect: { id: product.id } },
            ...(variant ? { variant: { connect: { id: variant.id } } } : {}),
            productNameSnapshot: product.name,
            variantNameSnapshot: variant ? `${variant.name}: ${variant.value}` : null,
            imageSnapshot: product.images[0] ?? null,
            unitPricePaise,
            quantity: line.quantity,
            gstRateBps,
            lineTotalPaise,
          });
        }

        // Delivery stays ₹0 until the client confirms a fee (lib/shipping.ts).
        const deliveryPaise = 0;
        // GST is added only for products with a rate; others are GST-inclusive.
        const totalPaise = subtotalPaise + gstPaise + deliveryPaise;

        if (request.paymentMethod === "cod" && !codAllowed(totalPaise / 100)) {
          throw new OrderRejected(
            400,
            `Cash on Delivery is available for orders up to ${formatInr(config.codMax)}. Please pay online.`,
          );
        }

        const now = new Date();
        const day = istDay(now);
        // Atomic per-day counter: unique numbers even when orders arrive at the same moment.
        const [counter] = await tx.$queryRaw<{ value: number }[]>`
          INSERT INTO "OrderCounter" ("day", "value") VALUES (${day}, 1)
          ON CONFLICT ("day") DO UPDATE SET "value" = "OrderCounter"."value" + 1
          RETURNING "value"`;
        const orderNumber = `TS-${day}-${String(counter!.value).padStart(4, "0")}`;

        const a = request.address;
        const created = await tx.order.create({
          data: {
            orderNumber,
            user: { connect: { id: userId } },
            status: "placed",
            paymentMethod: request.paymentMethod,
            // COD: collected on delivery. Demo: no real payment. Live: pending until verified.
            paymentStatus: request.paymentMethod === "cod" ? "pending" : live ? "pending" : "demo",
            subtotalPaise,
            gstPaise,
            deliveryPaise,
            totalPaise,
            fullName: a.fullName,
            phone: a.mobile,
            email: a.email,
            line1: a.line1,
            line2: a.line2 || null,
            city: a.city,
            state: a.state,
            pincode: a.pincode,
            instructions: a.instructions || null,
            estimatedDelivery: new Date(now.getTime() + deliveryDays * 24 * 60 * 60 * 1000),
            idempotencyKey,
            items: { create: items },
          },
          include: { items: true },
        });

        // First order: keep its address as the user's default.
        if ((await tx.address.count({ where: { userId } })) === 0) {
          await tx.address.create({
            data: {
              userId,
              fullName: a.fullName,
              phone: a.mobile,
              line1: a.line1,
              line2: a.line2 || null,
              city: a.city,
              state: a.state,
              pincode: a.pincode,
              instructions: a.instructions || null,
              isDefault: true,
            },
          });
        }
        return created;
      },
      { timeout: 20_000 },
    );
  } catch (error) {
    if (error instanceof OrderRejected) return { ok: false, status: error.status, error: error.message };
    // Two identical requests at the same moment: the second one returns the first order.
    if (isUniqueViolation(error, "idempotencyKey")) {
      const first = await findByKey(userId, idempotencyKey);
      if (first && first !== "other-user") return { ok: true, order: first, created: false, razorpay: handoff(first) };
    }
    throw error;
  }

  if (!live) return { ok: true, order, created: true, razorpay: null };

  // Live mode: open the matching Razorpay order. If that fails, cancel ours and put the stock back.
  const keys = razorpayKeys();
  const rzpId = keys ? await createRazorpayOrder(keys, order) : null;
  if (!rzpId) {
    await cancelAndRestock(order);
    return {
      ok: false,
      status: 502,
      error: "Online payment is unavailable right now. Please try again or choose Cash on Delivery.",
    };
  }
  const withRzp = await db().order.update({
    where: { id: order.id },
    data: { razorpayOrderId: rzpId },
    include: { items: true },
  });
  return { ok: true, order: withRzp, created: true, razorpay: handoff(withRzp) };
}

/* Razorpay (live mode) ----------------------------------------------- */

/** What the browser needs to open Razorpay Checkout for an unpaid live order (no secrets). */
function handoff(order: Order): RazorpayHandoff | null {
  const keyId = getPublicPaymentConfig().razorpayKeyId;
  if (order.paymentMethod !== "razorpay" || order.paymentStatus !== "pending" || !order.razorpayOrderId || !keyId) {
    return null;
  }
  return {
    keyId,
    orderId: order.razorpayOrderId,
    amount: order.totalPaise,
    currency: "INR",
    prefill: { name: order.fullName, email: order.email, contact: order.phone },
  };
}

async function createRazorpayOrder(
  keys: { keyId: string; keySecret: string },
  order: Order,
): Promise<string | null> {
  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keys.keyId}:${keys.keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: order.totalPaise,
        currency: "INR",
        receipt: order.orderNumber,
        notes: { orderId: order.id },
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { id?: unknown };
    return typeof data.id === "string" ? data.id : null;
  } catch {
    return null;
  }
}

async function cancelAndRestock(order: OrderWithItems) {
  await db().$transaction(async (tx) => {
    for (const item of order.items) {
      if (item.variantId) {
        await tx.productVariant.updateMany({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
      } else {
        await tx.product.updateMany({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
    }
    await tx.order.update({ where: { id: order.id }, data: { status: "cancelled", paymentStatus: "failed" } });
  });
}

/**
 * Marks a live order paid after the server has checked Razorpay's signature.
 * Only the owner's order with the matching Razorpay order id is updated.
 */
export async function markRazorpayPaid(input: {
  userId: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signatureValid: boolean;
}): Promise<{ status: number; body: object }> {
  const order = await db().order.findFirst({
    where: { id: input.orderId, userId: input.userId, razorpayOrderId: input.razorpayOrderId },
  });
  if (!order) return { status: 404, body: { error: "Order not found." } };
  if (order.paymentStatus === "paid") return { status: 200, body: { orderId: order.id } };
  if (!input.signatureValid) return { status: 400, body: { error: "Payment could not be verified." } };
  await db().order.update({
    where: { id: order.id },
    data: { paymentStatus: "paid", razorpayPaymentId: input.razorpayPaymentId },
  });
  return { status: 200, body: { orderId: order.id } };
}

/* Reads (always scoped to the user) ---------------------------------- */

export function getOrdersForUser(userId: string) {
  return db().order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { quantity: true } } },
  });
}

/** The order only if it belongs to this user; otherwise null ("Order not found"). */
export function getOrderForUser(userId: string, orderId: string) {
  return db().order.findFirst({ where: { id: orderId, userId }, include: { items: true } });
}
