"use client";

import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { loginSchema, type LoginField, type LoginInput } from "@repo/shared/auth";
import { fieldErrors } from "@repo/shared/checkout";
import { login } from "../../lib/auth/actions";
import GoogleButton from "./google-button";
import PasswordField from "./password-field";
import TextField from "./text-field";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

const FIELD_ORDER: LoginField[] = ["email", "password"];

const EMPTY: LoginInput = { email: "", password: "" };

type Errors = Partial<Record<LoginField, string>>;

/**
 * Login form (spec 013, same layout as signup). The server action checks the
 * password, applies the rate limit, starts a session and redirects to `next`
 * (checked again on the server). Wrong email or password: one generic message.
 */
export default function LoginForm({ next }: { next?: string }) {
  const [values, setValues] = useState<LoginInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "checking">("idle");
  const fields = useRef(new Map<LoginField, HTMLInputElement>());
  // Blocks repeat submits at once (state only updates on the next render).
  const busy = useRef(false);

  const register = (field: LoginField) => (el: HTMLInputElement | null) => {
    if (el) fields.current.set(field, el);
    else fields.current.delete(field);
  };

  const update = (field: LoginField) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors(({ [field]: _cleared, ...rest }) => rest);
    setFormError(null);
  };

  const showErrors = (found: Errors) => {
    setErrors(found);
    const first = FIELD_ORDER.find((f) => found[f]);
    if (first) fields.current.get(first)?.focus();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy.current) return; // no double submission
    setFormError(null);

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      showErrors(fieldErrors(parsed.error) as Errors);
      return;
    }

    busy.current = true;
    setStatus("checking");
    // On success the server redirects and this never returns.
    let result: Awaited<ReturnType<typeof login>> | undefined;
    try {
      result = await login(parsed.data, next);
    } catch {
      result = { formError: "Could not log in. Check your connection and try again." };
    }
    if (!result) return; // redirecting: keep the button disabled until the next page loads
    busy.current = false;
    setStatus("idle");
    setValues((v) => ({ ...v, password: "" })); // never keep a rejected password around
    if (result.errors) showErrors(result.errors);
    if (result.formError) {
      setFormError(result.formError);
      fields.current.get("password")?.focus();
    }
  };

  const errorCount = Object.keys(errors).length;

  return (
    <>
      <h2 className="text-xl font-semibold text-text md:text-2xl">Log in to your account</h2>
      <p className="mt-1 text-[15px] text-muted">Enter your email and password to continue</p>

      <form noValidate onSubmit={onSubmit} className="mt-6 space-y-4">
        {/* Announced to screen readers on submit. */}
        <p aria-live="polite" className="sr-only">
          {errorCount > 0 ? `${errorCount} ${errorCount === 1 ? "field needs" : "fields need"} attention.` : ""}
        </p>

        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={update("email")}
          inputRef={register("email")}
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          value={values.password}
          error={errors.password}
          onChange={update("password")}
          inputRef={register("password")}
        />

        {formError && (
          <p role="alert" className="flex items-start gap-2 rounded-md border border-brand-950 bg-brand-50 px-3 py-2 text-sm text-text">
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-950" />
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={status !== "idle"}
          className={`inline-flex h-12 w-full items-center justify-center rounded-pill bg-brand-950 text-base font-semibold text-surface hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`}
        >
          {status === "checking" ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-sm text-muted" role="separator" aria-label="or">
        <span aria-hidden className="h-px flex-1 bg-line" />
        <span aria-hidden>or</span>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </div>

      <GoogleButton />

      <p className="mt-6 text-xs leading-relaxed text-muted">
        By continuing, you agree to our{" "}
        <Link href="/terms" className={`rounded-sm text-brand-700 underline-offset-2 hover:underline ${FOCUS}`}>
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className={`rounded-sm text-brand-700 underline-offset-2 hover:underline ${FOCUS}`}>
          Privacy Policy
        </Link>
        .
      </p>
      <p className="mt-4 text-center text-[15px] text-body">
        New here?{" "}
        <Link href="/signup" className={`rounded-sm font-semibold text-brand-700 underline-offset-2 hover:underline ${FOCUS}`}>
          Create an account
        </Link>
      </p>
    </>
  );
}
