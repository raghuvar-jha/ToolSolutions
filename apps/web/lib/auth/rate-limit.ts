/**
 * Login rate limit (spec 013), stored in LoginAttempt.
 *
 * 5 failed attempts for one email within 15 minutes block that email for
 * 15 minutes after the 5th failure. Blocked attempts are not recorded, so the
 * block doesn't keep extending. A successful login clears the failures.
 */
import { db } from "../db";

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
/** Attempts older than this are deleted when the email is next used. */
const KEEP_MS = 24 * 60 * 60 * 1000;

export async function isLoginBlocked(email: string): Promise<boolean> {
  const failures = await db().loginAttempt.findMany({
    where: { email, succeeded: false, createdAt: { gte: new Date(Date.now() - WINDOW_MS - LOCK_MS) } },
    orderBy: { createdAt: "desc" },
    take: MAX_FAILURES,
    select: { createdAt: true },
  });
  if (failures.length < MAX_FAILURES) return false;

  const newest = failures[0]!.createdAt.getTime();
  const oldest = failures[MAX_FAILURES - 1]!.createdAt.getTime();
  return newest - oldest <= WINDOW_MS && Date.now() - newest < LOCK_MS;
}

export async function recordLoginFailure(email: string): Promise<void> {
  await db().$transaction([
    db().loginAttempt.deleteMany({ where: { email, createdAt: { lt: new Date(Date.now() - KEEP_MS) } } }),
    db().loginAttempt.create({ data: { email, succeeded: false } }),
  ]);
}

export async function recordLoginSuccess(email: string): Promise<void> {
  await db().$transaction([
    db().loginAttempt.deleteMany({ where: { email, succeeded: false } }),
    db().loginAttempt.create({ data: { email, succeeded: true } }),
  ]);
}
