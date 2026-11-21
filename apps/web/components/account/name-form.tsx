"use client";

import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { useState, type FormEvent } from "react";
import { updateName } from "../../lib/account/actions";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";
const INPUT =
  "h-11 w-full rounded-md border border-faint/50 bg-surface px-3 text-[15px] text-text focus:outline-2 focus:-outline-offset-1 focus:outline-brand-950";

/** Name with an Edit button (spec 014). Email changes are out of scope. */
export default function NameForm({ name }: { name: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!editing) {
    return (
      <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-semibold text-text break-words">{name}</span>
        <button
          type="button"
          onClick={() => {
            setValue(name);
            setEditing(true);
          }}
          className={`rounded-sm text-sm text-brand-700 underline-offset-2 hover:underline ${FOCUS}`}
        >
          Edit<span className="sr-only"> name</span>
        </button>
      </span>
    );
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const result = await updateName(value).catch(() => ({ ok: false, error: "Could not save. Please try again." }));
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Could not save. Please try again.");
      return;
    }
    setError(null);
    setEditing(false);
    router.refresh();
  };

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-2">
      <label htmlFor="account-name" className="sr-only">
        Full name
      </label>
      <input
        id="account-name"
        value={value}
        maxLength={80}
        autoComplete="name"
        onChange={(e) => setValue(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "account-name-error" : undefined}
        className={INPUT}
      />
      {error && (
        <p id="account-name-error" className="flex items-start gap-1.5 text-sm text-text">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-950" />
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className={`inline-flex h-10 items-center rounded-pill bg-brand-950 px-5 text-sm font-semibold text-surface hover:bg-brand-900 disabled:opacity-60 ${FOCUS}`}
        >
          {busy ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className={`inline-flex h-10 items-center rounded-pill border border-brand-950 px-5 text-sm font-semibold text-brand-950 hover:bg-brand-50 ${FOCUS}`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
