import { ChevronDown } from "lucide-react";

export type Chip = { label: string; value: string };

type CategoryChipsProps = {
  chips: Chip[];
  selected: string;
  onSelect: (value: string) => void;
  label: string;
  /**
   * "chips": a row of filter buttons (desktop).
   * "select": a compact dropdown (mobile), so nothing scrolls sideways.
   */
  variant?: "chips" | "select";
};

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

/** Category filter, as chips or as a dropdown. Same options and state either way. */
export default function CategoryChips({
  chips,
  selected,
  onSelect,
  label,
  variant = "chips",
}: CategoryChipsProps) {
  if (variant === "select") {
    return (
      <div className="relative">
        <select
          aria-label={label}
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          className={`h-9 max-w-[55vw] appearance-none truncate rounded-md border border-line bg-surface pr-9 pl-3 text-sm font-medium text-text shadow-sm ${FOCUS}`}
        >
          {chips.map((chip) => (
            <option key={chip.value} value={chip.value}>
              {chip.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
        />
      </div>
    );
  }

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {chips.map((chip) => {
        const active = chip.value === selected;
        return (
          <button
            key={chip.value}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(chip.value)}
            className={`h-8 rounded-md border px-3 text-sm whitespace-nowrap transition-colors ${FOCUS} ${
              active
                ? "border-brand-950 bg-brand-950 text-surface"
                : "border-line bg-surface text-body hover:border-brand-950"
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
