"use client";

import { CircleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { addressSchema, fieldErrors, type AddressField } from "@repo/shared/checkout";
import { useCart } from "../../lib/cart/cart-context";
import { BROWSER_ORDERS_KEY } from "../../lib/orders/order-repository";
import { shippingQuote } from "../../lib/shipping";
import AddressForm, { ADDRESS_FIELDS, EMPTY_ADDRESS, type AddressValues } from "./address-form";
import CheckoutSummary from "./checkout-summary";
import PaymentOptions, { type PaymentChoice } from "./payment-options";
import StickyPayBar from "./sticky-pay-bar";

/** The browser-safe payment settings (from lib/payments.ts on the server). */
export type CheckoutConfig = {
  mode: "demo" | "live";
  codMax: number;
  razorpayAvailable: boolean;
};

type RazorpayHandoff = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  prefill: { name: string; email: string; contact: string };
};

type PlaceResponse = {
  orderId?: string;
  razorpay?: RazorpayHandoff | null;
  error?: string;
  fields?: Partial<Record<string, string>>;
};

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = { open: () => void; on: (event: string, cb: () => void) => void };

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

/** Unique per checkout visit; the server ignores repeats of the same key. */
function newIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function rememberOrder(id: string) {
  try {
    const raw = window.localStorage.getItem(BROWSER_ORDERS_KEY);
    const ids: unknown = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(ids) ? ids.filter((x): x is string => typeof x === "string") : [];
    window.localStorage.setItem(BROWSER_ORDERS_KEY, JSON.stringify([id, ...list.filter((x) => x !== id)].slice(0, 50)));
  } catch {
    // Storage blocked: the order still exists; it just won't appear in this browser's list.
  }
}

/** Live mode only: Razorpay's own script (card and UPI details stay inside its window). */
function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Checkout page body: address + payment (left), summary (right), mobile sticky
 * pay bar. Validates with the shared Zod schema, then POSTs only IDs and
 * quantities; the server recalculates every price.
 */
export default function CheckoutForm({ config }: { config: CheckoutConfig }) {
  const router = useRouter();
  const cart = useCart();
  const [values, setValues] = useState<AddressValues>(EMPTY_ADDRESS);
  const [errors, setErrors] = useState<Partial<Record<AddressField, string>>>({});
  const [errorCount, setErrorCount] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [idempotencyKey] = useState(newIdempotencyKey);
  const busy = useRef(false);
  const fields = useRef(new Map<AddressField, HTMLElement>());
  const alertRef = useRef<HTMLDivElement>(null);

  const codAvailable = cart.total <= config.codMax;
  const [choice, setChoice] = useState<PaymentChoice | null>(null);
  // Default: online if offered, else COD; drop COD if the total goes over the limit.
  const method: PaymentChoice | null =
    choice === "cod" && codAvailable
      ? "cod"
      : choice === "razorpay" && config.razorpayAvailable
        ? "razorpay"
        : config.razorpayAvailable
          ? "razorpay"
          : codAvailable
            ? "cod"
            : null;

  // Empty cart: nothing to check out (but not right after placing an order).
  useEffect(() => {
    if (cart.loaded && cart.items.length === 0 && !done) router.replace("/cart");
  }, [cart.loaded, cart.items.length, done, router]);

  const fieldRef = (name: AddressField) => (el: HTMLElement | null) => {
    if (el) fields.current.set(name, el);
    else fields.current.delete(name);
  };

  const onChange = (name: AddressField, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest);
  };

  const showError = (message: string) => {
    setServerError(message);
    requestAnimationFrame(() => alertRef.current?.focus());
  };

  const finish = (orderId: string) => {
    rememberOrder(orderId);
    setDone(true);
    cart.clearCart();
    router.push(`/orders/${orderId}`);
  };

  const payOnline = async (orderId: string, rzp: RazorpayHandoff) => {
    if (!(await loadRazorpay()) || !window.Razorpay) {
      showError("The payment window could not be opened. Please try again or choose Cash on Delivery.");
      return false;
    }
    return new Promise<boolean>((resolve) => {
      const checkout = new window.Razorpay!({
        key: rzp.keyId,
        order_id: rzp.orderId,
        amount: rzp.amount,
        currency: rzp.currency,
        name: "Tools Solutions",
        prefill: rzp.prefill,
        // The browser result is never trusted: the server verifies the signature.
        handler: async (res: RazorpaySuccess) => {
          const verify = await fetch("/api/orders", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              razorpayOrderId: res.razorpay_order_id,
              razorpayPaymentId: res.razorpay_payment_id,
              razorpaySignature: res.razorpay_signature,
            }),
          }).catch(() => null);
          if (verify?.ok) {
            finish(orderId);
            resolve(true);
          } else {
            showError("We couldn't confirm your payment. If money was deducted, it will be refunded or confirmed shortly.");
            resolve(false);
          }
        },
        modal: {
          ondismiss: () => {
            showError("Payment was not completed. You can try again.");
            resolve(false);
          },
        },
      });
      checkout.open();
    });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy.current) return; // double click / double Enter
    setServerError(null);

    const parsed = addressSchema.safeParse(values);
    if (!parsed.success) {
      const found = fieldErrors(parsed.error) as Partial<Record<AddressField, string>>;
      setErrors(found);
      setErrorCount(Object.keys(found).length);
      const first = ADDRESS_FIELDS.find((f) => found[f]);
      if (first) fields.current.get(first)?.focus();
      return;
    }
    setErrors({});
    setErrorCount(0);
    if (!method) {
      showError("No payment method is available for this order.");
      return;
    }

    busy.current = true;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          address: parsed.data,
          paymentMethod: method,
          lines: cart.items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as PlaceResponse;

      if (!res.ok || !data.orderId) {
        const serverFields: Partial<Record<AddressField, string>> = {};
        for (const [k, v] of Object.entries(data.fields ?? {})) {
          if (k.startsWith("address.") && v) serverFields[k.slice(8) as AddressField] = v;
        }
        if (Object.keys(serverFields).length > 0) setErrors(serverFields);
        showError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (data.razorpay) {
        await payOnline(data.orderId, data.razorpay);
        return;
      }
      finish(data.orderId);
    } catch {
      showError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  };

  if (!cart.loaded || cart.items.length === 0) {
    return (
      <div aria-busy="true" aria-label="Loading checkout" className="mt-8 grid gap-6 lg:grid-cols-[56fr_37fr] lg:gap-16">
        <div className="h-96 animate-pulse rounded-card bg-well motion-reduce:animate-none" />
        <div className="h-72 animate-pulse rounded-card bg-well motion-reduce:animate-none" />
      </div>
    );
  }

  const delivery = shippingQuote(cart.subtotal).kind === "free" ? "free" : "pending";

  return (
    <form id="checkout-form" noValidate onSubmit={onSubmit} className="mt-8 lg:mt-10">
      {/* Announced to screen readers when the form has errors. */}
      <p aria-live="polite" className="sr-only">
        {errorCount > 0 ? `${errorCount} ${errorCount === 1 ? "field needs" : "fields need"} attention.` : ""}
      </p>

      {serverError && (
        <div
          ref={alertRef}
          role="alert"
          tabIndex={-1}
          className="mb-6 flex items-start gap-3 rounded-card border border-brand-950 bg-brand-50 px-4 py-3 text-[15px] font-medium text-text focus:outline-none"
        >
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-brand-950" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[56fr_37fr] lg:items-start lg:gap-16">
        <div className="space-y-8">
          <AddressForm values={values} errors={errors} onChange={onChange} fieldRef={fieldRef} />
          <PaymentOptions
            value={method}
            onChange={setChoice}
            razorpayAvailable={config.razorpayAvailable}
            codAvailable={codAvailable}
            codMax={config.codMax}
            demo={config.mode === "demo"}
          />
        </div>
        <CheckoutSummary
          items={cart.items}
          gst={cart.gst}
          gstIncluded={cart.gstIncluded}
          total={cart.total}
          delivery={delivery}
          demo={config.mode === "demo" && method === "razorpay"}
          submitting={submitting}
          canPay={method !== null}
        />
      </div>

      <StickyPayBar total={cart.total} submitting={submitting} canPay={method !== null} />
    </form>
  );
}
