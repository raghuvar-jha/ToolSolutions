/**
 * Orders API (specs 009 and 014). Login required for every method.
 *
 * POST  /api/orders   place an order (Idempotency-Key header required)
 * PATCH /api/orders   live mode: verify a Razorpay payment signature
 *
 * The browser sends only product ids, variant values and quantities. Prices,
 * stock, GST, delivery and the total are recalculated by lib/orders/order-service.ts.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { fieldErrors, orderRequestSchema, paymentVerificationSchema } from "@repo/shared/checkout";
import { getCurrentUser } from "../../../lib/auth/session";
import { markRazorpayPaid, placeOrder } from "../../../lib/orders/order-service";
import { getPublicPaymentConfig, razorpayKeys } from "../../../lib/payments";

const IDEMPOTENCY_KEY = /^[A-Za-z0-9-]{16,64}$/;

const fail = (status: number, error: string, fields?: Partial<Record<string, string>>) =>
  NextResponse.json(fields ? { error, fields } : { error }, { status });

const LOGIN_REQUIRED = () => fail(401, "Please log in to place your order.");

/* POST: place an order ----------------------------------------------- */

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return LOGIN_REQUIRED();

  const key = request.headers.get("Idempotency-Key") ?? "";
  if (!IDEMPOTENCY_KEY.test(key)) return fail(400, "Missing or invalid Idempotency-Key header.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Invalid request.");
  }
  const parsed = orderRequestSchema.safeParse(body);
  if (!parsed.success) return fail(400, "Please check the highlighted fields.", fieldErrors(parsed.error));

  let result: Awaited<ReturnType<typeof placeOrder>>;
  try {
    result = await placeOrder({ userId: user.id, idempotencyKey: key, request: parsed.data });
  } catch (error) {
    console.error("order failed", (error as { code?: string })?.code ?? (error as Error)?.name);
    return fail(500, "Something went wrong. Please try again.");
  }
  if (!result.ok) return fail(result.status, result.error);

  const { order } = result;
  return NextResponse.json(
    { orderId: order.id, number: order.orderNumber, paymentStatus: order.paymentStatus, razorpay: result.razorpay },
    { status: result.created ? 201 : 200 },
  );
}

/* PATCH: live Razorpay payment verification -------------------------- */

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return LOGIN_REQUIRED();

  const keys = getPublicPaymentConfig().mode === "live" ? razorpayKeys() : null;
  if (!keys) return fail(400, "Online payment is not enabled.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Invalid request.");
  }
  const parsed = paymentVerificationSchema.safeParse(body);
  if (!parsed.success) return fail(400, "Invalid payment details.");
  const v = parsed.data;

  // Razorpay signs "<order_id>|<payment_id>" with the key secret. Only this check confirms payment.
  const expected = createHmac("sha256", keys.keySecret)
    .update(`${v.razorpayOrderId}|${v.razorpayPaymentId}`)
    .digest();
  const given = Buffer.from(v.razorpaySignature, "hex");
  const signatureValid = given.length === expected.length && timingSafeEqual(given, expected);

  const result = await markRazorpayPaid({
    userId: user.id,
    orderId: v.orderId,
    razorpayOrderId: v.razorpayOrderId,
    razorpayPaymentId: v.razorpayPaymentId,
    signatureValid,
  });
  return NextResponse.json(result.body, { status: result.status });
}
