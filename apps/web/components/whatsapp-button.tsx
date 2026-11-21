"use client";

import { MessageCircle } from "lucide-react";
import { useSyncExternalStore } from "react";
import { whatsappMessage, whatsappNumber } from "../lib/site-config";

type WhatsAppButtonProps = {
  /** Product page: the message names the product and links to it. */
  product?: { name: string; path: string };
  /**
   * Mobile: also clear a sticky bar that sits on top of the tab bar
   * (product page "Buy Now" bar, cart total bar; both ~65px).
   */
  aboveStickyBar?: boolean;
};

const LABEL = "Chat with us on WhatsApp";

const noopSubscribe = () => () => {};

/** https://wa.me/<number>?text=<encoded message> */
const chatUrl = (message: string) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

/**
 * Floating WhatsApp chat button, bottom-right (spec 015). Hidden while
 * whatsappNumber is empty. Mobile: sits above the tab bar (and the sticky bar
 * when there is one) and the safe area. Uses the lucide chat icon, not the WhatsApp logo.
 */
export default function WhatsAppButton({ product, aboveStickyBar = false }: WhatsAppButtonProps) {
  // The full product URL needs the site's origin, known only in the browser ("" while server rendering).
  const origin = useSyncExternalStore(noopSubscribe, () => window.location.origin, () => "");

  if (!whatsappNumber) return null;

  const message = product
    ? `Hi, I'm interested in ${product.name}: ${origin}${product.path}`
    : whatsappMessage;

  // Mobile offsets: tab bar 60px (+ sticky bar 65px) + 16px gap + safe area. Desktop: 24px.
  const bottom = aboveStickyBar
    ? "bottom-[calc(141px+env(safe-area-inset-bottom))]"
    : "bottom-[calc(76px+env(safe-area-inset-bottom))]";

  return (
    <a
      href={chatUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={LABEL}
      // Above page content, below the mobile sticky bars (z-30), tab bar (z-40) and modals.
      className={`group fixed right-4 ${bottom} z-20 grid size-[52px] place-items-center rounded-pill bg-success text-surface shadow-md transition-transform duration-150 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 motion-reduce:transition-none motion-reduce:hover:scale-100 lg:right-6 lg:bottom-6 lg:size-14`}
    >
      <MessageCircle aria-hidden className="size-6 lg:size-7" />
      {/* Desktop tooltip on hover or keyboard focus, to the left of the button. */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-full mr-3 hidden rounded-md bg-brand-950 px-3 py-1.5 text-sm whitespace-nowrap text-surface opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 lg:block"
      >
        {LABEL}
      </span>
    </a>
  );
}
