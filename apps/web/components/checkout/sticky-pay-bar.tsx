"use client";

import { ArrowRight } from "lucide-react";
import { formatInr } from "../../lib/Products";
import { PAY_BUTTON } from "./checkout-summary";

type StickyPayBarProps = {
  total: number;
  submitting: boolean;
  canPay: boolean;
};

/**
 * Mobile only: total + "Proceed to pay", fixed just above the tab bar
 * (59px + 1px border, see mobile-tab-bar.tsx). Submits the checkout form.
 */
export default function StickyPayBar({ total, submitting, canPay }: StickyPayBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-30 border-t border-line bg-surface shadow-md lg:hidden">
      <div className="mx-auto flex w-full max-w-site items-center gap-4 px-4 py-3">
        <p className="shrink-0 leading-tight">
          <span className="block text-xs text-muted">Total</span>
          <span className="block text-lg font-bold text-brand-950">{formatInr(total)}</span>
        </p>
        <button type="submit" disabled={submitting || !canPay} className={PAY_BUTTON}>
          {submitting ? "Placing order…" : "Proceed to pay"}
          {!submitting && <ArrowRight aria-hidden className="size-5" />}
        </button>
      </div>
    </div>
  );
}
