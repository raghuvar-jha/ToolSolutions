"use client";

import Link from "next/link";
import { useEffect, useState, type RefObject } from "react";

type StickyBuyBarProps = {
  /** The in-page buttons; the bar shows once they have scrolled above the viewport. */
  targetRef: RefObject<HTMLElement | null>;
  price: string;
  /** Short label for the selected option, e.g. "13 mm". */
  detail?: string;
  buyHref: string;
  disabled: boolean;
};

/**
 * Mobile-only bar with the price and Buy Now. Sits just above the fixed
 * mobile tab bar (59px + safe-area inset, see mobile-tab-bar.tsx).
 */
export default function StickyBuyBar({
  targetRef,
  price,
  detail,
  buyHref,
  disabled,
}: StickyBuyBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    // A scroll check (once per frame) rather than IntersectionObserver: a jump
    // from below the buttons straight to the top never crosses them, so an
    // observer would not fire and the bar would stay up.
    let frame = 0;
    const update = () => {
      frame = 0;
      // Visible only after scrolling *past* the buttons (fully above the viewport).
      setVisible(el.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [targetRef]);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-30 border-t border-line bg-surface shadow-md transition-transform duration-200 motion-reduce:transition-none lg:hidden ${
        visible ? "translate-y-0" : "invisible translate-y-full"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-site items-center justify-between gap-4 px-4">
        <p className="leading-tight">
          <span className="block text-lg font-semibold text-brand-950">{price}</span>
          {detail && <span className="block text-xs text-muted">{detail}</span>}
        </p>
        {disabled ? (
          <span className="inline-flex h-11 items-center rounded-pill bg-brand-950/40 px-6 text-[15px] font-semibold text-surface">
            Out of stock
          </span>
        ) : (
          <Link
            href={buyHref}
            tabIndex={visible ? undefined : -1}
            className="inline-flex h-11 items-center rounded-pill bg-brand-950 px-6 text-[15px] font-semibold text-surface hover:bg-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
          >
            Buy Now
          </Link>
        )}
      </div>
    </div>
  );
}
