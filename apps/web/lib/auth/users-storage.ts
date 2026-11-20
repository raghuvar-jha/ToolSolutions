/**
 * Demo account storage (spec 010): localStorage "users-v1", an array of
 * { id, name, email, createdAt }. Passwords are never stored: saveUser does
 * not even accept one. Real accounts move to the server with login (later).
 */

const STORAGE_KEY = "users-v1";

export type StoredUser = {
  id: string;
  name: string;
  /** Always lowercased, so the uniqueness check ignores capitals. */
  email: string;
  createdAt: string;
};

export type SaveResult =
  | { ok: true; user: StoredUser }
  | { ok: false; reason: "duplicate" | "storage" };

const isUser = (u: unknown): u is StoredUser => {
  const r = u as Partial<StoredUser> | null;
  return (
    !!r &&
    typeof r.id === "string" &&
    typeof r.name === "string" &&
    typeof r.email === "string" &&
    typeof r.createdAt === "string"
  );
};

/** Saved accounts, or null when localStorage is unavailable (private mode, blocked). */
function readUsers(): StoredUser[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isUser) : [];
  } catch (error) {
    // Corrupt data: start a fresh list. Unavailable storage: report it.
    return error instanceof SyntaxError ? [] : null;
  }
}

const normalise = (email: string) => email.trim().toLowerCase();

/** Case-insensitive check against the saved accounts. */
export function emailExists(email: string): boolean {
  const target = normalise(email);
  return (readUsers() ?? []).some((u) => u.email === target);
}

/** The saved account for an email (any capitals), "storage" when localStorage is unavailable, or null. */
export function findUserByEmail(email: string): StoredUser | "storage" | null {
  const users = readUsers();
  if (users === null) return "storage";
  const target = normalise(email);
  return users.find((u) => u.email === target) ?? null;
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** Save a new account (name and email only). Rejects duplicates and unavailable storage. */
export function saveUser(input: { name: string; email: string }): SaveResult {
  const users = readUsers();
  if (users === null) return { ok: false, reason: "storage" };

  const email = normalise(input.email);
  if (users.some((u) => u.email === email)) return { ok: false, reason: "duplicate" };

  const user: StoredUser = {
    id: newId(),
    name: input.name.trim(),
    email,
    createdAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...users, user]));
  } catch {
    return { ok: false, reason: "storage" };
  }
  return { ok: true, user };
}
