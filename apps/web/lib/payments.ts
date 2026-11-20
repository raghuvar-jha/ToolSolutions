/**
 * Payment settings (spec 009), read from the environment ON THE SERVER ONLY.
 *
 * - PAYMENT_MODE: "demo" (default, no real payment) or "live" (Razorpay Checkout).
 * - RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET: live mode only. The secret never
 *   leaves the server; only the key ID may reach the browser, and only in live mode.
 * - COD_MAX_AMOUNT: Cash on Delivery is offered only for totals up to this (₹).
 *
 * None of these use the NEXT_PUBLIC_ prefix, so Next.js never inlines them into
 * the browser bundle. Import this file only from server code.
 */

if (typeof window !== "undefined") {
  throw new Error("lib/payments.ts is server-only");
}

export type PaymentMode = "demo" | "live";
export type PaymentMethod = "cod" | "razorpay";

/** Placeholder COD limit when COD_MAX_AMOUNT is unset. NEEDS CLIENT CONFIRMATION. */
const DEFAULT_COD_MAX = 10000;

function readMode(): PaymentMode {
  return process.env.PAYMENT_MODE === "live" ? "live" : "demo";
}

function readCodMax(): number {
  const n = Number.parseInt(process.env.COD_MAX_AMOUNT ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_COD_MAX;
}

/** Live keys, or null when either is missing. */
export function razorpayKeys(): { keyId: string; keySecret: string } | null {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  return keyId && keySecret ? { keyId, keySecret } : null;
}

/** Settings the checkout page may send to the browser (never the secret). */
export type PublicPaymentConfig = {
  mode: PaymentMode;
  codMax: number;
  /** Online payment can be offered (always in demo; live needs both keys). */
  razorpayAvailable: boolean;
  /** Live mode only, for Razorpay Checkout. */
  razorpayKeyId: string | null;
};

export function getPublicPaymentConfig(): PublicPaymentConfig {
  const mode = readMode();
  const keys = mode === "live" ? razorpayKeys() : null;
  return {
    mode,
    codMax: readCodMax(),
    razorpayAvailable: mode === "demo" || keys !== null,
    razorpayKeyId: keys?.keyId ?? null,
  };
}

/** COD rule, applied by the server to the recalculated total. */
export const codAllowed = (total: number) => total <= readCodMax();
