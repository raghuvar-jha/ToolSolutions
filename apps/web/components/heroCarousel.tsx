"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  DEMO_SLIDE_COUNT,
  HERO_AUTOPLAY_MS,
  HERO_SLIDES,
  type HeroSlide,
} from "../lib/heroSlides";

// Same as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

const FOCUS_ON_LIGHT =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

type MobileSlide =
  | { kind: "image"; id: string; slide: HeroSlide }
  | { kind: "demo"; id: string };

const MOBILE_SLIDES: MobileSlide[] = [
  ...HERO_SLIDES.map((slide) => ({
    kind: "image" as const,
    id: slide.id,
    slide,
  })),
  ...Array.from({ length: DEMO_SLIDE_COUNT }, (_, i) => ({
    kind: "demo" as const,
    id: `demo-${i + 1}`,
  })),
];

/* ------------------------------------------------------------------ */
/* Desktop: static layout, no sliding                                  */
/* ------------------------------------------------------------------ */

function DesktopHero() {
  const [main, ...side] = HERO_SLIDES;
  if (!main) return null;

  return (
    <div className="hidden gap-4 lg:grid lg:grid-cols-[2fr_1fr]">
      <div className="relative min-h-80 overflow-hidden rounded-banner bg-well">
        <Image
          src={main.src}
          alt={main.alt}
          fill
          loading="eager"
          sizes="(min-width: 1280px) 820px, 66vw"
          className="object-cover"
        />
      </div>
      <div className="grid gap-4">
        {side.map((slide) => (
          <div
            key={slide.id}
            className="relative aspect-[2076/1150] overflow-hidden rounded-banner bg-well"
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(min-width: 1280px) 410px, 33vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile: carousel                                                    */
/* ------------------------------------------------------------------ */

function ArrowButton({
  direction,
  controls,
  onClick,
}: {
  direction: "prev" | "next";
  controls: string;
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "Previous slide" : "Next slide"}
      aria-controls={controls}
      onClick={onClick}
      className={`grid size-8 place-items-center rounded-pill border border-line bg-surface text-brand-950 hover:bg-brand-50 ${FOCUS_ON_LIGHT}`}
    >
      <Icon aria-hidden className="size-4" />
    </button>
  );
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function MobileCarousel() {
  const trackId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  const count = MOBILE_SLIDES.length;

  const goTo = useCallback(
    (target: number) => {
      const track = trackRef.current;
      if (!track) return;
      const next = (target + count) % count; // wraps both ways
      track.scrollTo({
        left: next * track.clientWidth,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
      setIndex(next);
    },
    [count],
  );

  // Auto-advance. Restarts whenever the slide changes, so a manual
  // move always gets a full interval before the next automatic one.
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      const track = trackRef.current;
      const hidden = !track || track.offsetParent === null; // desktop: display:none
      if (hidden || document.hidden || prefersReducedMotion()) return;
      goTo(index + 1);
    }, HERO_AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [index, paused, goTo]);

  // Keep the dots in sync with swipes.
  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured offers"
      className="lg:hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
    >
      <div
        id={trackId}
        ref={trackRef}
        onScroll={handleScroll}
        aria-live={paused ? "polite" : "off"}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {MOBILE_SLIDES.map((item, i) => (
          <div
            key={item.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className="relative aspect-video w-full shrink-0 snap-center snap-always bg-well"
          >
            {item.kind === "image" ? (
              <Image
                src={item.slide.src}
                alt={item.slide.alt}
                fill
                loading={i === 0 ? "eager" : "lazy"}
                sizes="calc(100vw - 32px)"
                className="object-cover"
              />
            ) : (
              <div className="size-full bg-brand-100">
                <span className="sr-only">Placeholder slide</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-center gap-2">
        <ArrowButton
          direction="prev"
          controls={trackId}
          onClick={() => goTo(index - 1)}
        />
        <div className="flex gap-1">
          {MOBILE_SLIDES.map((item, i) => {
            const active = i === index;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={active ? "true" : undefined}
                aria-controls={trackId}
                onClick={() => goTo(i)}
                className={`grid h-6 min-w-6 place-items-center rounded-pill ${FOCUS_ON_LIGHT}`}
              >
                <span
                  className={`block h-2 rounded-pill transition-all ${
                    active ? "w-5 bg-brand-950" : "w-2 bg-muted"
                  }`}
                />
              </button>
            );
          })}
        </div>
        <ArrowButton
          direction="next"
          controls={trackId}
          onClick={() => goTo(index + 1)}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export function HeroCarousel() {
  return (
    <div className={`${CONTAINER} pt-4 lg:pt-6`}>
      {/* Mobile: blank box in place of the mock's seasonal illustration */}
      <div />
      <MobileCarousel />
      <DesktopHero />
    </div>
  );
}

export default HeroCarousel;
