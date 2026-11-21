"use server";

/** Review actions (spec 014): the user comes from the session, never from the browser. */
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../auth/session";
import { productPageHref } from "../catalog/format";
import { deleteReview as removeReview, saveReview as storeReview, type ReviewWriteResult } from "./review-service";

export async function saveReview(productId: unknown, input: unknown): Promise<ReviewWriteResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in to write a review." };
  if (typeof productId !== "string") return { ok: false, error: "Product not found." };
  const result = await storeReview({ id: user.id, name: user.name }, productId, input);
  if (result.ok) revalidatePath(productPageHref(productId));
  return result;
}

export async function deleteReview(productId: unknown, reviewId: unknown): Promise<void> {
  const user = await getCurrentUser();
  if (!user || typeof reviewId !== "string" || typeof productId !== "string") return;
  await removeReview(user.id, reviewId);
  revalidatePath(productPageHref(productId));
}
