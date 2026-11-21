/**
 * Sessions (spec 013). Server only.
 *
 * The random token lives only in the "session" cookie; the database stores its
 * SHA-256 hash. Sessions last 30 days and are deleted when found expired.
 * Never log or return the token or its hash.
 */
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "../db";
import { safeNext } from "./safe-next";

const COOKIE_NAME = "session";
const SESSION_DAYS = 30;

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Creates a session row and sets the cookie. Only from a server action or route handler. */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db().session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/** The logged-in user for this request, or null. One database read per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await db().session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      expiresAt: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await db().session.deleteMany({ where: { id: session.id } });
    return null;
  }
  return session.user;
});

/**
 * The logged-in user, or a redirect to /login?next=<path>.
 * `path` is the page being protected, e.g. "/checkout?product=pd-001".
 */
export async function requireUser(path: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(safeNext(path, "/"))}`);
  return user;
}

/** Deletes this browser's session row and clears the cookie. Only from a server action or route handler. */
export async function deleteCurrentSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) await db().session.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.delete({ name: COOKIE_NAME, path: "/" });
}
