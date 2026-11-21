"use server";

/** Save toggle (spec 014). Logged out: the caller sends the user to /login. */
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../auth/session";
import { setSaved } from "./saved-service";

export async function setProductSaved(
  productId: unknown,
  saved: unknown,
): Promise<{ ok: true; saved: boolean } | { ok: false; reason: "login" | "invalid" }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "login" };
  if (typeof productId !== "string" || typeof saved !== "boolean") return { ok: false, reason: "invalid" };
  const now = await setSaved(user.id, productId, saved);
  revalidatePath("/saved");
  return { ok: true, saved: now };
}
