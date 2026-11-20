"use client";

import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { useState, type Ref } from "react";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "new-password" | "current-password";
  error?: string;
  /** Extra guidance shown under the field until there is an error. */
  hint?: string;
  inputRef?: Ref<HTMLInputElement>;
};

/** Password input with a show/hide toggle ("Show password" / "Hide password"). */
export default function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  error,
  hint,
  inputRef,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-text">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={128}
          aria-required
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-11 w-full rounded-md border bg-surface pr-12 pl-3 text-[15px] text-text placeholder:text-faint focus:outline-2 focus:-outline-offset-1 focus:outline-brand-950 ${
            error ? "border-brand-950 ring-1 ring-brand-950" : "border-faint/50"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-controls={id}
          className={`absolute inset-y-0 right-0 grid w-11 place-items-center rounded-md text-muted hover:text-text ${FOCUS}`}
        >
          {visible ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm text-text">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-950" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
