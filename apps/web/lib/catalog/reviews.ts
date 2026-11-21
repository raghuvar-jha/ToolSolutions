import type { ProductReview } from "./types";

/** Average of the review ratings (one decimal), or null when there are none. */
export const averageRating = (reviews: Pick<ProductReview, "rating">[]) =>
  reviews.length === 0
    ? null
    : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10;

/** Number of reviews per star value, index 0 = 5 stars … index 4 = 1 star. */
export const ratingCounts = (reviews: Pick<ProductReview, "rating">[]) =>
  [5, 4, 3, 2, 1].map((star) => reviews.filter((r) => r.rating === star).length);
