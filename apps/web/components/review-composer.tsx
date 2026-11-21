"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, Star } from "lucide-react";
import { useState, type FormEvent } from "react";
import { deleteReview, saveReview } from "../lib/reviews/actions";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

// Same input style as the address form (DESIGN.md: one input style).
const INPUT =
  "w-full rounded-md border border-faint/50 bg-surface px-3 text-[15px] text-text placeholder:text-faint focus:outline-2 focus:-outline-offset-1 focus:outline-brand-950";

const PRIMARY = `inline-flex h-11 items-center justify-center rounded-pill bg-brand-950 px-6 text-[15px] font-semibold text-surface hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`;
const SECONDARY = `inline-flex h-11 items-center justify-center rounded-pill border border-brand-950 bg-surface px-6 text-[15px] font-semibold text-brand-950 hover:bg-brand-50 ${FOCUS}`;

export type ComposerState =
  | { kind: "logged-out"; loginHref: string }
  | {
      kind: "logged-in";
      canReview: boolean;
      mine: { id: string; rating: number; title: string | null; body: string } | null;
    };

type Fields = Partial<Record<"rating" | "title" | "body", string>>;

/**
 * Write, edit or delete your review (spec 014). The server decides who may
 * review (a matching order) and sets verifiedPurchase; this form only collects text.
 */
export default function ReviewComposer({ productId, state }: { productId: string; state: ComposerState }) {
  if (state.kind === "logged-out") {
    return (
      <p className="mt-6 text-[15px] text-body">
        <Link href={state.loginHref} className={`rounded-sm font-semibold text-brand-700 underline-offset-2 hover:underline ${FOCUS}`}>
          Login to write a review
        </Link>
      </p>
    );
  }
  if (!state.canReview && !state.mine) {
    return <p className="mt-6 text-[15px] text-muted">Only customers who bought this product can write a review.</p>;
  }
  return <MyReview productId={productId} mine={state.mine} canEdit={state.canReview} />;
}

function MyReview({
  productId,
  mine,
  canEdit,
}: {
  productId: string;
  mine: { id: string; rating: number; title: string | null; body: string } | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(mine === null);
  const [busy, setBusy] = useState(false);

  if (mine && !editing) {
    return (
      <div className="mt-6 rounded-card border border-line bg-surface p-4 lg:p-5">
        <p className="text-sm text-muted">Your review</p>
        <p className="mt-1 flex items-center gap-1" role="img" aria-label={`${mine.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} aria-hidden className={`size-4 ${i <= mine.rating ? "fill-star text-star" : "fill-line text-faint/50"}`} />
          ))}
        </p>
        {mine.title && <p className="mt-2 font-semibold text-text">{mine.title}</p>}
        <p className="mt-1 text-[15px] leading-relaxed text-body">{mine.body}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {canEdit && (
            <button type="button" onClick={() => setEditing(true)} className={SECONDARY}>
              Edit review
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              if (!window.confirm("Delete your review?")) return;
              setBusy(true);
              await deleteReview(productId, mine.id).catch(() => null);
              setBusy(false);
              router.refresh();
            }}
            className={`inline-flex h-11 items-center rounded-pill px-4 text-[15px] text-body hover:text-brand-700 disabled:opacity-60 ${FOCUS}`}
          >
            Delete review
          </button>
        </div>
      </div>
    );
  }

  return (
    <ReviewForm
      productId={productId}
      initial={mine}
      onDone={() => {
        setEditing(false);
        router.refresh();
      }}
      onCancel={mine ? () => setEditing(false) : undefined}
    />
  );
}

function ReviewForm({
  productId,
  initial,
  onDone,
  onCancel,
}: {
  productId: string;
  initial: { rating: number; title: string | null; body: string } | null;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [fields, setFields] = useState<Fields>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await saveReview(productId, { rating, title, body }).catch(() => ({
      ok: false as const,
      error: "Could not save your review. Please try again.",
      fields: undefined,
    }));
    setBusy(false);
    if (result.ok) {
      onDone();
      return;
    }
    setFields(result.fields ?? {});
    setError(result.error);
  };

  return (
    <form noValidate onSubmit={onSubmit} className="mt-6 max-w-xl space-y-4 rounded-card border border-line bg-surface p-4 lg:p-5">
      <h3 className="text-lg font-semibold text-text">{initial ? "Edit your review" : "Write a review"}</h3>

      <fieldset>
        <legend className="mb-1.5 text-sm text-text">Your rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <label key={i} className="cursor-pointer rounded-sm has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-brand-700">
              <input
                type="radio"
                name="rating"
                value={i}
                checked={rating === i}
                onChange={() => setRating(i)}
                className="sr-only"
              />
              <Star aria-hidden className={`size-7 ${i <= rating ? "fill-star text-star" : "fill-line text-faint/50"}`} />
              <span className="sr-only">
                {i} {i === 1 ? "star" : "stars"}
              </span>
            </label>
          ))}
        </div>
        <FieldMessage message={fields.rating} />
      </fieldset>

      <div>
        <label htmlFor="review-title" className="mb-1.5 block text-sm text-text">
          Title <span className="text-muted">(optional)</span>
        </label>
        <input id="review-title" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} className={`h-11 ${INPUT}`} />
        <FieldMessage message={fields.title} />
      </div>

      <div>
        <label htmlFor="review-body" className="mb-1.5 block text-sm text-text">
          Your review
        </label>
        <textarea
          id="review-body"
          rows={4}
          maxLength={2000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          aria-invalid={fields.body ? true : undefined}
          className={`py-2 ${INPUT}`}
        />
        <FieldMessage message={fields.body} />
      </div>

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-md border border-brand-950 bg-brand-50 px-3 py-2 text-sm text-text">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-950" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className={PRIMARY}>
          {busy ? "Saving…" : initial ? "Save changes" : "Post review"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={SECONDARY}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function FieldMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-sm text-text">
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-950" />
      {message}
    </p>
  );
}
