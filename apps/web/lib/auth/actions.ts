"use server";

/**
 * Signup and login (spec 013). Server actions: always POST, with Next's origin check.
 * They return only field or form messages. Passwords, hashes and tokens never
 * leave the server and are never logged (database errors are logged by code only).
 */
import { redirect } from "next/navigation";
import {
  loginSchema,
  signupSchema,
  type LoginField,
  type SignupField,
} from "@repo/shared/auth";
import { fieldErrors } from "@repo/shared/checkout";
import { db } from "../db";
import { hashPassword, verifyAgainstDummy, verifyPassword } from "./password";
import { isLoginBlocked, recordLoginFailure, recordLoginSuccess } from "./rate-limit";
import { safeNext } from "./safe-next";
import { createSession } from "./session";

export type AuthResult<Field extends string> = {
  errors?: Partial<Record<Field, string>>;
  formError?: string;
};

const LOGIN_FAILED = "Email or password is incorrect";
const TOO_MANY = "Too many attempts. Try again later.";
const DUPLICATE = "An account with this email already exists";
const UNEXPECTED = "Something went wrong. Please try again.";

/** Logs what failed without the error message, which could echo query values. */
function logFailure(where: string, error: unknown) {
  const code = (error as { code?: unknown } | null)?.code;
  console.error(`${where} failed`, typeof code === "string" ? code : (error as Error)?.name);
}

const isUniqueViolation = (error: unknown) =>
  (error as { code?: unknown } | null)?.code === "P2002";

export async function signup(input: unknown): Promise<AuthResult<SignupField>> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) as AuthResult<SignupField>["errors"] };

  const email = parsed.data.email.toLowerCase();
  try {
    if (await db().user.findUnique({ where: { email }, select: { id: true } })) {
      return { errors: { email: DUPLICATE } };
    }
    const user = await db().user.create({
      data: { name: parsed.data.name, email, passwordHash: await hashPassword(parsed.data.password) },
      select: { id: true },
    });
    await createSession(user.id);
  } catch (error) {
    if (isUniqueViolation(error)) return { errors: { email: DUPLICATE } };
    logFailure("signup", error);
    return { formError: UNEXPECTED };
  }
  redirect("/account");
}

export async function login(input: unknown, next: unknown): Promise<AuthResult<LoginField>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) as AuthResult<LoginField>["errors"] };

  const email = parsed.data.email.toLowerCase();
  try {
    if (await isLoginBlocked(email)) return { formError: TOO_MANY };

    const user = await db().user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });
    const ok = user
      ? await verifyPassword(user.passwordHash, parsed.data.password)
      : await verifyAgainstDummy(parsed.data.password);

    if (!user || !ok) {
      await recordLoginFailure(email);
      return { formError: LOGIN_FAILED };
    }
    await recordLoginSuccess(email);
    await createSession(user.id);
  } catch (error) {
    logFailure("login", error);
    return { formError: UNEXPECTED };
  }
  redirect(safeNext(next));
}
