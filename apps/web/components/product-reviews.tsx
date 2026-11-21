"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useRef, useState } from "react";
import { averageRating, ratingCounts } from "../lib/catalog/reviews";
import type { ProductReview } from "../lib/catalog/types";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

// UTC so server and browser print the same date (no hydration mismatch).
const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const countLabel = (n: number) => `${n} ${n === 1 ? "review" : "reviews"}`;

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-1" aria-label={`${rating} out of 5 stars`} role="img">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden
          className={`size-4 ${i <= rating ? "fill-star text-star" : "fill-line text-faint/50"}`}
        />
      ))}
    </span>
  );
}

/**
 * "Rating & Reviews": average + count + 5 bars on the left, one review card at
 * a time on the right (arrows or swipe). Everything is computed from the real
 * review list; with no reviews only "No reviews yet" is shown.
 */
export default function ProductReviews({ reviews }: { reviews: ProductReview[] }) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);

  const average = averageRating(reviews);
  const counts = ratingCounts(reviews);
  const total = reviews.length;
  const review = reviews[index];

  const go = (next: number) => setIndex((next + total) % total);

  return (
    <section aria-labelledby="reviews-heading">
      <h2
        id="reviews-heading"
        className="text-2xl font-semibold text-text lg:text-[32px]"
      >
        Rating &amp; Reviews
      </h2>

      {average === null || !review ? (
        <p className="mt-4 rounded-card border border-faint/30 bg-surface px-4 py-8 text-center text-body">
          No reviews yet
        </p>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[52fr_48fr] lg:gap-16">
          {/* Summary */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
            <div className="shrink-0">
              <p className="flex items-baseline">
                <span className="text-7xl leading-none font-semibold text-text lg:text-[112px]">
                  {average.toFixed(1)}
                </span>
                <span className="ml-1 text-2xl text-muted lg:text-3xl">/5</span>
              </p>
              <p className="mt-3 text-base text-muted">({countLabel(total)})</p>
            </div>

            <ul className="w-full max-w-sm flex-1 space-y-2.5">
              {counts.map((count, i) => {
                const star = 5 - i;
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                  <li key={star} className="flex items-center gap-2 text-sm text-text">
                    <Star aria-hidden className="size-4 fill-star text-star" />
                    <span className="w-3 text-center">{star}</span>
                    <span
                      role="img"
                      aria-label={`${star} stars: ${countLabel(count)}`}
                      className="h-1.5 flex-1 overflow-hidden rounded-pill bg-line"
                    >
                      <span
                        className="block h-full rounded-pill bg-brand-950"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span aria-hidden className="w-5 text-right text-xs text-muted">
                      {count}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* One review at a time */}
          <div
            className="flex min-h-56 touch-pan-y flex-col rounded-card border border-faint/30 bg-surface p-5 lg:p-6"
            onPointerDown={(e) => {
              startX.current = e.clientX;
            }}
            onPointerUp={(e) => {
              if (startX.current === null || total < 2) return;
              const dx = e.clientX - startX.current;
              startX.current = null;
              if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
            }}
          >
            <article aria-live="polite" className="flex-1">
              <h3 className="text-base font-semibold text-text">{review.author}</h3>
              <div className="mt-2 flex items-center justify-between gap-3">
                <Stars rating={review.rating} />
                <time dateTime={review.date} className="text-sm text-muted">
                  {dateFormat.format(new Date(review.date))}
                </time>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-body">
                &ldquo;{review.text}&rdquo;
              </p>
            </article>

            {total > 1 && (
              <div className="mt-5 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  aria-label="Previous review"
                  className={`grid size-9 place-items-center rounded-pill border border-faint/40 text-text hover:border-brand-950 ${FOCUS}`}
                >
                  <ChevronLeft aria-hidden className="size-5" />
                </button>
                {/* Progress track: the dark segment marks the current review. */}
                <div className="flex flex-1 flex-col items-center gap-1.5">
                  <span aria-hidden className="relative h-1 w-32 overflow-hidden rounded-pill bg-line">
                    <span
                      className="absolute inset-y-0 rounded-pill bg-brand-950 transition-[left] duration-200 motion-reduce:transition-none"
                      style={{ width: `${100 / total}%`, left: `${(100 / total) * index}%` }}
                    />
                  </span>
                  <span className="text-xs text-muted">
                    {index + 1} / {total}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  aria-label="Next review"
                  className={`grid size-9 place-items-center rounded-pill border border-faint/40 text-text hover:border-brand-950 ${FOCUS}`}
                >
                  <ChevronRight aria-hidden className="size-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
