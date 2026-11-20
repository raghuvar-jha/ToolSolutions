"use client";

import { CircleAlert } from "lucide-react";

/** Labelled text / email input with the error under it (auth forms; DESIGN.md input style). */
export default function TextField({
  id,
  label,
  type,
  autoComplete,
  value,
  error,
  onChange,
  inputRef,
}: {
  id: string;
  label: string;
  type: "text" | "email";
  autoComplete: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  inputRef: (el: HTMLInputElement | null) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-text">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        name={id}
        type={type}
        inputMode={type === "email" ? "email" : undefined}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={type === "email" ? 120 : 80}
        aria-required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-11 w-full rounded-md border bg-surface px-3 text-[15px] text-text placeholder:text-faint focus:outline-2 focus:-outline-offset-1 focus:outline-brand-950 ${
          error ? "border-brand-950 ring-1 ring-brand-950" : "border-faint/50"
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm text-text">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-950" />
          {error}
        </p>
      )}
    </div>
  );
}
