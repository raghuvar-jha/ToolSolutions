/**
 * Password hashing (spec 013): argon2id with OWASP's recommended minimum
 * (19 MiB memory, 2 passes, 1 lane). Server only. Never log the inputs or outputs.
 */
import { hash, verify } from "@node-rs/argon2";

const OPTIONS = {
  algorithm: 2, // Algorithm.Argon2id (a const enum, so it can't be imported by name)
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

/** true when the password matches. A malformed hash counts as a mismatch. */
export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

let dummyHash: Promise<string> | null = null;

/**
 * Same work as a real check, for logins with an unknown email, so response
 * time doesn't reveal which emails have accounts. Always false.
 */
export async function verifyAgainstDummy(password: string): Promise<false> {
  dummyHash ??= hashPassword("dummy-password-0");
  await verifyPassword(await dummyHash, password);
  return false;
}
