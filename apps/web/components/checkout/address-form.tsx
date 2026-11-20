"use client";

import { CircleAlert, Plus } from "lucide-react";
import { INDIAN_STATES, type AddressField } from "@repo/shared/checkout";

export type AddressValues = Record<AddressField, string>;

export const EMPTY_ADDRESS: AddressValues = {
  fullName: "",
  mobile: "",
  email: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  instructions: "",
};

/** Form order: used to focus the first field with an error. */
export const ADDRESS_FIELDS: AddressField[] = [
  "fullName",
  "mobile",
  "email",
  "line1",
  "line2",
  "city",
  "state",
  "pincode",
  "instructions",
];

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

/** One input style (DESIGN.md): thin border, primary focus ring. */
const INPUT =
  "w-full rounded-md border bg-surface px-3 text-[15px] text-text placeholder:text-faint focus:outline-2 focus:-outline-offset-1 focus:outline-brand-950";

type FieldConfig = {
  name: AddressField;
  label: string;
  optional?: boolean;
  autoComplete: string;
  type?: "text" | "tel" | "email";
  inputMode?: "numeric" | "email" | "tel";
  maxLength?: number;
  /** Grid span on sm+: full row or half. */
  wide?: boolean;
};

const FIELDS: FieldConfig[] = [
  { name: "fullName", label: "Full name", autoComplete: "name", maxLength: 80 },
  { name: "mobile", label: "Mobile number", autoComplete: "tel-national", type: "tel", inputMode: "numeric", maxLength: 10 },
  { name: "email", label: "Email", autoComplete: "email", type: "email", inputMode: "email", maxLength: 120, wide: true },
  { name: "line1", label: "Address line 1", autoComplete: "address-line1", maxLength: 120, wide: true },
  { name: "line2", label: "Address line 2", optional: true, autoComplete: "address-line2", maxLength: 120, wide: true },
  { name: "city", label: "City", autoComplete: "address-level2", maxLength: 60 },
];

type AddressFormProps = {
  values: AddressValues;
  errors: Partial<Record<AddressField, string>>;
  onChange: (name: AddressField, value: string) => void;
  /** Registers each control so the checkout can focus the first error. */
  fieldRef: (name: AddressField) => (el: HTMLElement | null) => void;
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm text-text">
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-950" />
      {message}
    </p>
  );
}

function Label({ htmlFor, label, optional }: { htmlFor: string; label: string; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm text-text">
      {label}
      {optional ? (
        <span className="font-normal text-muted"> (optional)</span>
      ) : (
        <span aria-hidden className="text-muted"> *</span>
      )}
    </label>
  );
}

/**
 * "Select a delivery address": v1 has one address, entered here and selected
 * with a radio. Errors show under each field. Nothing is sent to the server
 * until the order is placed.
 */
export default function AddressForm({ values, errors, onChange, fieldRef }: AddressFormProps) {
  const border = (name: AddressField) =>
    errors[name] ? "border-brand-950 ring-1 ring-brand-950" : "border-faint/50";
  const described = (name: AddressField) => (errors[name] ? `${name}-error` : undefined);

  const filled = values.fullName.trim() && values.line1.trim();
  const preview = [values.line1, values.city, values.state, values.pincode].filter((s) => s.trim()).join(", ");

  return (
    <section aria-labelledby="address-heading">
      <h2 id="address-heading" className="text-lg font-semibold text-text lg:text-xl">
        Select a delivery address
      </h2>

      <div className="mt-4 rounded-card border border-line bg-surface p-4 shadow-sm lg:p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="radio"
            name="address-choice"
            defaultChecked
            className="mt-1 size-4 shrink-0 accent-brand-950"
          />
          <span className="min-w-0">
            <span className="block font-semibold text-text">
              {filled ? values.fullName : "Deliver to this address"}
            </span>
            <span className="block truncate text-sm text-muted">
              {filled ? preview : "Enter your delivery details below."}
            </span>
          </span>
        </label>

        <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.name} className={f.wide ? "sm:col-span-2" : undefined}>
              <Label htmlFor={f.name} label={f.label} optional={f.optional} />
              <input
                ref={fieldRef(f.name)}
                id={f.name}
                name={f.name}
                type={f.type ?? "text"}
                inputMode={f.inputMode}
                autoComplete={f.autoComplete}
                maxLength={f.maxLength}
                value={values[f.name]}
                onChange={(e) =>
                  onChange(
                    f.name,
                    f.inputMode === "numeric" ? e.target.value.replace(/\D/g, "") : e.target.value,
                  )
                }
                aria-required={!f.optional}
                aria-invalid={errors[f.name] ? true : undefined}
                aria-describedby={described(f.name)}
                className={`h-11 ${INPUT} ${border(f.name)}`}
              />
              <FieldError id={`${f.name}-error`} message={errors[f.name]} />
            </div>
          ))}

          <div>
            <Label htmlFor="state" label="State" />
            <select
              ref={fieldRef("state")}
              id="state"
              name="state"
              autoComplete="address-level1"
              value={values.state}
              onChange={(e) => onChange("state", e.target.value)}
              aria-required
              aria-invalid={errors.state ? true : undefined}
              aria-describedby={described("state")}
              className={`h-11 ${INPUT} ${border("state")} ${values.state ? "" : "text-faint"}`}
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s} className="text-text">
                  {s}
                </option>
              ))}
            </select>
            <FieldError id="state-error" message={errors.state} />
          </div>

          <div>
            <Label htmlFor="pincode" label="Pincode" />
            <input
              ref={fieldRef("pincode")}
              id="pincode"
              name="pincode"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              value={values.pincode}
              onChange={(e) => onChange("pincode", e.target.value.replace(/\D/g, ""))}
              aria-required
              aria-invalid={errors.pincode ? true : undefined}
              aria-describedby={described("pincode")}
              className={`h-11 ${INPUT} ${border("pincode")}`}
            />
            <FieldError id="pincode-error" message={errors.pincode} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="instructions" label="Delivery instructions" optional />
            <textarea
              ref={fieldRef("instructions")}
              id="instructions"
              name="instructions"
              rows={2}
              maxLength={200}
              value={values.instructions}
              onChange={(e) => onChange("instructions", e.target.value)}
              aria-invalid={errors.instructions ? true : undefined}
              aria-describedby={described("instructions")}
              placeholder="e.g. Call before delivery"
              className={`py-2 ${INPUT} ${border("instructions")}`}
            />
            <FieldError id="instructions-error" message={errors.instructions} />
          </div>
        </div>
      </div>

      {/* v1 supports one address; more addresses need accounts (later). */}
      <button
        type="button"
        aria-disabled="true"
        title="Saving more addresses is coming soon"
        className={`mt-3 inline-flex cursor-not-allowed items-center gap-1.5 rounded-md px-1 py-1 text-sm text-muted ${FOCUS}`}
      >
        <Plus aria-hidden className="size-4" />
        Add new address
        <span className="sr-only"> (coming soon)</span>
      </button>
    </section>
  );
}
