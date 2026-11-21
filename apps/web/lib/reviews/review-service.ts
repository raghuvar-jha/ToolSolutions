/**
 * Reviews (spec 014). Server only.
 *
 * - Only users with a qualifying order for the product can review it, once per product.
 *   Qualifying: not cancelled, and paid, demo-paid or Cash on Delivery (plan decision D3).
 * - verifiedPurchase is always set here, never taken from the browser.
 * - Edits and deletes match both the review id and the user's id.
 * - Sample reviews (isSample) are shown only when SHOW_SAMPLE_REVIEWS is on, and the
 *   average and count include only the reviews that are shown.
 */
import { z } from "zod";
import { averageRating } from "../catalog/reviews";
import { SHOW_SAMPLE_REVIEWS } from "../catalog/config";
import type { ProductReview } from "../catalog/types";
import { db } from "../db";
import { notifyReviewPublished } from "../notifications/notification-service";

export const reviewInputSchema = z.object({
  rating: z.number().int().min(1, "Choose a rating").max(5, "Choose a rating"),
  title: z.string().trim().max(100, "Title can be at most 100 characters").optional().default(""),
  body: z
    .string()
    .trim()
    .min(10, "Write at least 10 characters")
    .max(2000, "Review can be at most 2000 characters"),
});

export type ReviewInput = z.input<typeof reviewInputSchema>;

export type ShownReview = ProductReview & { title: string | null; verifiedPurchase: boolean };

export type ReviewsForProduct = {
  reviews: ShownReview[];
  average: number | null;
  count: number;
};

const isRating = (n: number): n is ProductReview["rating"] => Number.isInteger(n) && n >= 1 && n <= 5;

/** Published reviews for a product, oldest first, with the average and count of exactly these. */
export async function getReviewsForProduct(productId: string): Promise<ReviewsForProduct> {
  const rows = await db().review.findMany({
    where: {
      productId,
      status: "published",
      product: { isActive: true },
      ...(SHOW_SAMPLE_REVIEWS ? {} : { isSample: false }),
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  const reviews = rows.flatMap((r): ShownReview[] =>
    isRating(r.rating)
      ? [
          {
            id: r.id,
            author: r.authorName,
            rating: r.rating,
            date: r.createdAt.toISOString().slice(0, 10),
            text: r.body,
            title: r.title,
            verifiedPurchase: r.verifiedPurchase,
          },
        ]
      : [],
  );
  return { reviews, average: averageRating(reviews), count: reviews.length };
}

/** True when the user has a qualifying order that contains the product. */
export async function hasPurchased(userId: string, productId: string): Promise<boolean> {
  const order = await db().order.findFirst({
    where: {
      userId,
      status: { not: "cancelled" },
      items: { some: { productId } },
      OR: [{ paymentStatus: { in: ["paid", "demo"] } }, { paymentMethod: "cod", paymentStatus: "pending" }],
    },
    select: { id: true },
  });
  return order !== null;
}

export type MyReview = { id: string; rating: number; title: string | null; body: string };

/** What the product page needs to show the review form for this user. */
export async function getReviewStatus(
  userId: string,
  productId: string,
): Promise<{ canReview: boolean; mine: MyReview | null }> {
  const [mine, purchased] = await Promise.all([
    db().review.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true, rating: true, title: true, body: true },
    }),
    hasPurchased(userId, productId),
  ]);
  return { canReview: purchased, mine };
}

export type ReviewWriteResult =
  | { ok: true }
  | { ok: false; error: string; fields?: Partial<Record<"rating" | "title" | "body", string>> };

/** Creates the user's review, or updates it if one exists. */
export async function saveReview(
  user: { id: string; name: string },
  productId: string,
  input: unknown,
): Promise<ReviewWriteResult> {
  const parsed = reviewInputSchema.safeParse(input);
  if (!parsed.success) {
    const fields: Partial<Record<"rating" | "title" | "body", string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as "rating" | "title" | "body";
      fields[key] ??= issue.message;
    }
    return { ok: false, error: "Please check your review.", fields };
  }
  if (!(await hasPurchased(user.id, productId))) {
    return { ok: false, error: "You can review products you have bought." };
  }

  const data = {
    rating: parsed.data.rating,
    title: parsed.data.title || null,
    body: parsed.data.body,
    authorName: user.name,
    verifiedPurchase: true,
  };
  await db().$transaction(async (tx) => {
    const existing = await tx.review.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
      select: { id: true },
    });
    if (existing) {
      await tx.review.update({ where: { id: existing.id }, data });
      return;
    }
    const created = await tx.review.create({
      data: { ...data, userId: user.id, productId, isSample: false, status: "published" },
      select: { id: true },
    });
    // Spec 016: notify on first publish only; edits don't send another notification.
    await notifyReviewPublished(created.id, tx);
  });
  return { ok: true };
}

export async function deleteReview(userId: string, reviewId: string): Promise<void> {
  await db().review.deleteMany({ where: { id: reviewId, userId } });
}
