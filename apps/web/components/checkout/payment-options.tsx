"use client";

import { Banknote, Info, ShieldCheck } from "lucide-react";
import { formatInr } from "../../lib/catalog/format";

export type PaymentChoice = "razorpay" | "cod";

type PaymentOptionsProps = {
  value: PaymentChoice | null;
  onChange: (value: PaymentChoice) => void;
  razorpayAvailable: boolean;
  codAvailable: boolean;
  codMax: number;
  demo: boolean;
  error?: string;
};

/**
 * "Choose Payment Method": online payment via Razorpay (card / UPI details are
 * entered only in Razorpay's own window) and Cash on Delivery (only under the
 * COD limit). No card, CVV or expiry fields exist in this app.
 */
export default function PaymentOptions({
  value,
  onChange,
  razorpayAvailable,
  codAvailable,
  codMax,
  demo,
  error,
}: PaymentOptionsProps) {
  const card = (selected: boolean) =>
    `block cursor-pointer rounded-card border bg-surface p-4 shadow-sm transition-colors has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-brand-700 lg:p-5 ${
      selected ? "border-brand-950 ring-1 ring-brand-950" : "border-line hover:border-faint"
    }`;

  return (
    <fieldset aria-describedby={error ? "payment-error" : undefined}>
      <legend className="text-lg font-semibold text-text lg:text-xl">Choose Payment Method</legend>

      <div className="mt-4 space-y-3">
        {razorpayAvailable ? (
          <label className={card(value === "razorpay")}>
            <span className="flex items-start gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={value === "razorpay"}
                onChange={() => onChange("razorpay")}
                className="mt-1 size-4 shrink-0 accent-brand-950"
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2 font-semibold text-text">
                  Pay online
                  {/* Text, not the Razorpay logo: no brand assets are used without their guidelines. */}
                  <span className="rounded-md border border-line px-1.5 py-0.5 text-xs font-semibold text-brand-950">
                    Razorpay
                  </span>
                  {demo && (
                    <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-xs tracking-wide text-brand-700">
                      DEMO MODE
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-sm text-muted">UPI, Cards, Netbanking, Wallets</span>
                {value === "razorpay" && (
                  <span className="mt-3 flex items-start gap-2 rounded-md bg-well px-3 py-2 text-sm text-body">
                    <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-700" />
                    {demo
                      ? "Demo mode: no real payment is taken. Your order is marked as paid (demo)."
                      : "You'll complete payment in a secure window."}
                  </span>
                )}
              </span>
            </span>
          </label>
        ) : (
          <p className="flex items-start gap-2 rounded-card border border-line bg-well px-4 py-3 text-sm text-body">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-700" />
            Online payment is unavailable right now.
            {codAvailable ? " You can still pay with Cash on Delivery." : ""}
          </p>
        )}

        {codAvailable ? (
          <label className={card(value === "cod")}>
            <span className="flex items-start gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={value === "cod"}
                onChange={() => onChange("cod")}
                className="mt-1 size-4 shrink-0 accent-brand-950"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-semibold text-text">
                  <Banknote aria-hidden className="size-5 text-brand-700" />
                  Cash on Delivery
                </span>
                <span className="mt-0.5 block text-sm text-muted">Pay when your order arrives</span>
              </span>
            </span>
          </label>
        ) : (
          <p className="text-sm text-muted">
            Cash on Delivery is available for orders up to {formatInr(codMax)}.
          </p>
        )}
      </div>

      {error && (
        <p id="payment-error" className="mt-2 text-sm text-text">
          {error}
        </p>
      )}
    </fieldset>
  );
}
