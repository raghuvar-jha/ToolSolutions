import { Check } from "lucide-react";

const STEPS = ["Cart", "Address", "Payment"] as const;
export type CheckoutStep = (typeof STEPS)[number];

/**
 * Cart (done) — Address (current) — Payment (next). The connecting line is
 * filled up to the current step. Compact on mobile.
 */
export default function Stepper({ current }: { current: CheckoutStep }) {
  const currentIndex = STEPS.indexOf(current);

  return (
    <nav aria-label="Checkout progress" className="mx-auto w-full max-w-md">
      <ol className="flex items-start">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={step} className="relative flex flex-1 flex-col items-center">
              {/* Line to the previous step, filled when this step is reached. */}
              {i > 0 && (
                <span
                  aria-hidden
                  className={`absolute top-3.5 right-1/2 h-0.5 w-full -translate-y-1/2 ${
                    i <= currentIndex ? "bg-brand-950" : "bg-line"
                  }`}
                />
              )}
              <span
                aria-hidden
                className={`relative z-10 grid size-7 place-items-center rounded-pill text-xs font-semibold ${
                  done || active
                    ? "bg-brand-950 text-surface"
                    : "border border-faint bg-surface text-muted"
                }`}
              >
                {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
              </span>
              <span
                aria-current={active ? "step" : undefined}
                className={`mt-2 text-sm lg:text-base ${active ? "font-semibold text-text" : "text-muted"}`}
              >
                {step}
                <span className="sr-only">{done ? " (done)" : active ? " (current step)" : ""}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
