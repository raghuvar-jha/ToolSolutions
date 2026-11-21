"use client";

import { Heart } from "lucide-react";
import { useSaved } from "../lib/saved/saved-context";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

const VARIANTS = {
  /** Round icon button over a product card image. */
  card: "absolute top-2 right-2 z-10 grid size-9 place-items-center rounded-pill bg-surface text-text shadow-sm hover:text-brand-700",
  /** Round outlined icon button next to the product page title. */
  page: "grid size-11 shrink-0 place-items-center rounded-pill border border-faint/40 bg-surface text-text hover:border-brand-700 hover:text-brand-700",
  /** Small text button ("Save" / "Saved") in a cart line. */
  text: "flex shrink-0 items-center gap-1.5 rounded-md px-1 py-0.5 text-sm text-body hover:text-brand-700",
} as const;

type SaveButtonProps = {
  productId: string;
  productName: string;
  variant: keyof typeof VARIANTS;
  /**
   * Cart line (spec 014): pressing saves the product (never un-saves) and then
   * calls this, which removes the line from the cart.
   */
  onSaved?: () => void;
};

/**
 * Heart toggle that adds a product to, or removes it from, the user's saved list
 * (database). Logged out: goes to /login?next=<product page>.
 */
export default function SaveButton({ productId, productName, variant, onSaved }: SaveButtonProps) {
  const { isSaved, toggle, save } = useSaved();
  const saved = isSaved(productId);
  const iconSize = variant === "text" ? "size-4" : "size-5";

  return (
    <button
      type="button"
      aria-pressed={saved}
      // Fixed name + aria-pressed: screen readers say "Save Power Drill, pressed".
      aria-label={`Save ${productName}`}
      title={saved ? "Remove from saved" : "Save for later"}
      onClick={(e) => {
        // Inside a card, never follow the card's link.
        e.preventDefault();
        e.stopPropagation();
        if (onSaved) {
          void save(productId).then((ok) => ok && onSaved());
        } else {
          toggle(productId);
        }
      }}
      className={`${VARIANTS[variant]} transition-colors ${FOCUS}`}
    >
      <Heart
        aria-hidden
        className={`${iconSize} ${saved ? "fill-brand-700 text-brand-700" : ""}`}
      />
      {variant === "text" && (saved ? "Saved" : "Save")}
    </button>
  );
}
