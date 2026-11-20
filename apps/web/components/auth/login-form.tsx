"use client";

import Link from "next/link";
import { CircleAlert, CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { loginSchema, type LoginField, type LoginInput } from "@repo/shared/auth";
import { fieldErrors } from "@repo/shared/checkout";
import { findUserByEmail } from "../../lib/auth/users-storage";
import GoogleButton from "./google-button";
import PasswordField from "./password-field";
import TextField from "./text-field";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

const FIELD_ORDER: LoginField[] = ["email", "password"];

const EMPTY: LoginInput = { email: "", password: "" };

/** Wait before leaving the page after a successful login. */
const REDIRECT_MS = 1000;

type Errors = Partial<Record<LoginField, string>>;

/**
 * Login form (demo, same layout as signup). Validates with the shared Zod
 * schema and finds the account by email (any capitals). Passwords are never
 * stored in this demo, so the password is not checked and no session is
 * created; real sign-in comes when accounts move to the server.
 */
export default function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState<LoginInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "checking" | "done">("idle");
  const [name, setName] = useState("");
  const fields = useRef(new Map<LoginField, HTMLInputElement>());
  // Blocks repeat submits at once (state only updates on the next render).
  const busy = useRef(false);

  useEffect(() => {
    if (status !== "done") return;
    const timer = setTimeout(() => router.push("/"), REDIRECT_MS);
    return () => clearTimeout(timer);
  }, [status, router]);

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

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
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
    const user = findUserByEmail(parsed.data.email);
    if (user === "storage" || user === null) {
      busy.current = false;
      setStatus("idle");
      if (user === "storage") setFormError("Could not log in from this browser");
      else showErrors({ email: "No account found with this email" });
      return;
    }
    setName(user.name);
    setValues(EMPTY); // drop the password from memory
    setErrors({});
    setStatus("done");
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
        <p role="status" className={status === "done" ? "flex items-start gap-2 rounded-md bg-success-bg px-3 py-2 text-sm text-success" : "sr-only"}>
          {status === "done" && (
            <>
              <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
              Welcome back, {name}. Taking you to the home page… (Demo: you stay signed out until accounts are live.)
            </>
          )}
        </p>

        <button
          type="submit"
          disabled={status !== "idle"}
          className={`inline-flex h-12 w-full items-center justify-center rounded-pill bg-brand-950 text-base font-semibold text-surface hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`}
        >
          {status === "checking" ? "Logging in…" : status === "done" ? "Logged in" : "Log in"}
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
