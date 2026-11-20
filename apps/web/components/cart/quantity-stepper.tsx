"use client";

import { Minus, Plus } from "lucide-react";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

type QuantityStepperProps = {
  value: number;
  /** Highest allowed value (the stock level). */
  max: number;
  onChange: (value: number) => void;
  /** Product name, so screen readers hear which line the stepper belongs to. */
  label: string;
};

/** − [qty] + in a rounded bordered box. Minimum 1, maximum `max`. */
export default function QuantityStepper({ value, max, onChange, label }: QuantityStepperProps) {
  const button = `grid size-9 place-items-center rounded-md text-text hover:bg-well disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent ${FOCUS}`;
  return (
    <div
      role="group"
      aria-label={`Quantity for ${label}`}
      className="inline-flex items-center rounded-card border border-faint/40 bg-surface"
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
        className={button}
      >
        <Minus aria-hidden className="size-4" />
      </button>
      <output aria-live="polite" className="min-w-7 text-center text-[15px] font-medium text-text">
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={button}
      >
        <Plus aria-hidden className="size-4" />
      </button>
    </div>
  );
}
