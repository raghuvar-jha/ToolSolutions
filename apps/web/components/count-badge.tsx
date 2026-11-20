"use client";

import { useState } from "react";

type CountBadgeProps = {
  count: number;
  /** Hidden until the stored list has loaded, so it never flashes 0. */
  loaded: boolean;
  /** Hide the badge while the count is 0 (small spaces such as the mobile pills). */
  hideZero?: boolean;
};

/**
 * Round count badge on the top-right corner of a header icon (cart, saved).
 * It pops briefly when the count goes up, so adding an item is noticed.
 * Decorative: the link around it carries the count in its label.
 */
export default function CountBadge({ count, loaded, hideZero = false }: CountBadgeProps) {
  // Track the previous count during render (no effect needed) and bump a key
  // when it rises after loading; the new key restarts the pop animation.
  const [prev, setPrev] = useState({ count, loaded });
  const [bump, setBump] = useState(0);
  if (prev.count !== count || prev.loaded !== loaded) {
    if (prev.loaded && loaded && count > prev.count) setBump((b) => b + 1);
    setPrev({ count, loaded });
  }

  if (!loaded || (hideZero && count === 0)) return null;

  return (
    <span
      key={bump}
      aria-hidden
      className={`absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-pill bg-badge px-1 text-xs leading-none font-semibold text-brand-950 ${
        bump > 0 ? "animate-badge-pop motion-reduce:animate-none" : ""
      }`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
