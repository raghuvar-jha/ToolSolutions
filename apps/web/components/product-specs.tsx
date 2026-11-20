import type { ProductSpec } from "../lib/Products";

type ProductSpecsProps = {
  specs: ProductSpec[];
  inBox: string[];
};

/**
 * Specs table + "What's in the box" list, shown inside the Description box.
 * Only real data is shown: empty values are dropped and empty blocks are hidden.
 */
export default function ProductSpecs({ specs, inBox }: ProductSpecsProps) {
  const rows = specs.filter((s) => s.label.trim() && s.value.trim());
  const items = inBox.filter((i) => i.trim());

  if (rows.length === 0 && items.length === 0) return null;

  return (
    <div className="mt-4 space-y-4">
      {rows.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text">Specifications</h3>
          <dl className="mt-2 divide-y divide-line overflow-hidden rounded-card border border-faint/30 text-sm">
            {rows.map((s) => (
              <div key={s.label} className="grid grid-cols-[2fr_3fr] gap-3 px-3 py-2">
                <dt className="text-muted">{s.label}</dt>
                <dd className="font-semibold text-text">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {items.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text">What&apos;s in the box</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-body marker:text-faint">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
