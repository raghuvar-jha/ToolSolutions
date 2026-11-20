/**
 * Hero banner data (spec 002, DESIGN.md §5 "Hero").
 *
 * Desktop shows the three banners as a static layout (main + two side banners).
 * Mobile shows them in a carousel, followed by blank demo slides.
 */

export type HeroSlide = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "tct-hole-saw",
    src: "/images/hero/HeroImage-1.png",
    alt: "TCT Hole Saw: cut fast, cut clean, cut with confidence. Built strong for industry.",
    width: 2428,
    height: 1418,
  },
  {
    // Shows a third-party brand name. DESIGN.md §7: needs the client's written
    // dealer authorization (or a cropped version) before going live.
    id: "precision-measuring-tools",
    src: "/images/hero/HeroImage-2.png",
    alt: "Precision measuring tools: calipers, micrometers and dial gauges.",
    width: 2076,
    height: 1150,
  },
  {
    id: "tct-annular-cutters",
    src: "/images/hero/HeroImage-3.png",
    alt: "TCT Annular Cutters: premium cutting performance, unmatched precision.",
    width: 2076,
    height: 1150,
  },
];

/** Blank placeholder slides appended to the mobile carousel (demo only). */
export const DEMO_SLIDE_COUNT = 0;

/** Auto-advance interval for the mobile carousel. */
export const HERO_AUTOPLAY_MS = 5000;
