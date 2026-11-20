"use client";

import Link from "next/link";
import { Award } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { visibleCertificates, type SiteCertificate } from "../lib/certificates";
import { CERTIFICATIONS_CONTENT as COPY } from "../lib/site-content";
import CertificateCard from "./certificate-card";
import CertificateOverlay from "./certificate-overlay";

// Same classes as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

/** Cards in the row: 4 on mobile (2×2), 3 from md up. */
const MOBILE_CARDS = 4;
const DESKTOP_CARDS = 3;

/*
 * How far the card row hangs below the banner from md up (3 columns): 44% of a card's height
 * (inspiration: 132 of 301px). Card = 12px padding + certificate image
 * (1962×1384, ratio 0.7054); card width = (row width − 2 × 15px gaps) / 3.
 * 0.44 × card height ≈ 10.35% of the row width (the padding terms cancel out).
 */
const OVERHANG_LG = "md:-mb-[10.35%]";
const OVERHANG_SPACE_LG = "md:mb-[10.35%]";

/**
 * Layout per the inspiration banner: rounded brand-700 panel inside the shared
 * container, heading + subheading on the left, pill button on the right,
 * decorative outline icon, and a row of certificate cards overlapping the
 * panel's bottom edge.
 */
export default function CertificatesSection() {
  const shown = visibleCertificates().slice(0, MOBILE_CARDS);

  const [active, setActive] = useState<SiteCertificate | null>(null);
  const [opener, setOpener] = useState<HTMLElement | null>(null);
  const cardRefs = useRef(new Map<number, HTMLButtonElement>());
  const handleClose = useCallback(() => setActive(null), []);

  // Spec: hide the whole section when nothing may be shown.
  if (shown.length === 0) return null;

  // 4 slots for the mobile 2×2 grid, in data order. A certificate repeats only
  // when fewer than 4 are set to show. Slots past DESKTOP_CARDS are hidden
  // from md up, so desktop shows the first 3.
  const slots = Array.from(
    { length: MOBILE_CARDS },
    (_, i) => shown[i % shown.length]!,
  );

  return (
    <section aria-labelledby="certifications-heading" className="py-6 lg:py-10">
      <div className={CONTAINER}>
        <div
          // flow-root stops the card row's negative margin from collapsing
          // into this panel's margin, so the cards really hang below it.
          className={`relative mb-[15.5%] flow-root overflow-visible rounded-banner bg-brand-900 px-5 pt-8 lg:px-[47px] lg:pt-[50px] ${OVERHANG_SPACE_LG}`}
        >
          {/* Decorative outline, like the inspiration's leaf. */}
          <Award
            aria-hidden
            strokeWidth={1.25}
            className="pointer-events-none absolute top-10 left-[54%] hidden size-[200px] text-surface/25 lg:block"
          />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
            <div>
              <h2
                id="certifications-heading"
                className="max-w-[540px] text-[28px] leading-tight font-bold tracking-tight text-surface lg:text-[46px] lg:leading-[54px]"
              >
                {COPY.heading}
              </h2>
              <p className="mt-3 text-sm text-brand-100 lg:mt-[18px] lg:text-[15px]">
                {COPY.subheading}
              </p>
            </div>

            <Link
              href={COPY.viewAllHref}
              className="inline-flex h-12 shrink-0 items-center self-start rounded-pill border border-brand-950 bg-brand-950 px-6 text-[15px] font-medium text-surface transition-colors hover:bg-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface lg:mt-10 lg:h-[54px]"
            >
              {COPY.viewAllLabel}
            </Link>
          </div>

          <ul
            className={`relative mt-8 -mb-[15.5%] grid grid-cols-2 items-start gap-3 md:grid-cols-3 md:gap-[15px] lg:mt-[46px] ${OVERHANG_LG}`}
          >
            {slots.map((c, i) => (
              <li
                key={`${c.id}-${i}`}
                className={i >= DESKTOP_CARDS ? "md:hidden" : undefined}
              >
                <CertificateCard
                  certificate={c}
                  ref={(el) => {
                    if (el) cardRefs.current.set(i, el);
                    else cardRefs.current.delete(i);
                  }}
                  onOpen={() => {
                    setOpener(cardRefs.current.get(i) ?? null);
                    setActive(c);
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <CertificateOverlay
        certificate={active}
        onClose={handleClose}
        returnFocusTo={opener}
      />
    </section>
  );
}
