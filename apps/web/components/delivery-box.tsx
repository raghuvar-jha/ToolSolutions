"use client";

import {
  CalendarDays,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { useSyncExternalStore } from "react";

type DeliveryBoxProps = {
  deliveryDays: number;
  returnPolicy: string;
  warrantyText: string;
};

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

const arrivalFormat = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** today + days, formatted in the viewer's time zone. */
const arrivalDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return arrivalFormat.format(d);
};

const noopSubscribe = () => () => {};

/**
 * "Delivery & Returns" accordion with a 2×2 grid (1 column on small phones).
 * The arrival date is computed in the browser only, so a pre-rendered page
 * never shows a stale build-time date.
 */
export default function DeliveryBox({
  deliveryDays,
  returnPolicy,
  warrantyText,
}: DeliveryBoxProps) {
  const arrival = useSyncExternalStore(
    noopSubscribe,
    () => arrivalDate(deliveryDays),
    () => null,
  );

  const items: { icon: LucideIcon; label: string; value: string | null }[] = [
    {
      icon: Truck,
      label: "Delivery time",
      value: `${deliveryDays} ${deliveryDays === 1 ? "day" : "days"}`,
    },
    { icon: CalendarDays, label: "Estimated arrival", value: arrival },
    { icon: RotateCcw, label: "Return policy", value: returnPolicy },
    { icon: ShieldCheck, label: "Warranty", value: warrantyText },
  ];

  return (
    <details
      open
      className="group rounded-card border border-faint/30 bg-surface [&_summary::-webkit-details-marker]:hidden"
    >
      <summary
        className={`flex cursor-pointer list-none items-center justify-between gap-4 rounded-card px-4 py-3 lg:px-5 lg:py-4 ${FOCUS}`}
      >
        <h2 className="text-base font-semibold text-text">Delivery &amp; Returns</h2>
        <ChevronDown
          aria-hidden
          className="size-5 shrink-0 text-text transition-transform group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <dl className="grid gap-x-6 gap-y-5 px-4 pt-1 pb-5 sm:grid-cols-2 lg:px-5">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-brand-50 text-brand-700">
              <Icon aria-hidden className="size-5" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs text-muted">{label}</dt>
              {/* Arrival is filled in after load (browser date). */}
              <dd className="mt-0.5 min-h-5 text-sm font-semibold text-text">
                {value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </details>
  );
}
