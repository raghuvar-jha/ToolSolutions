import type { ReactNode } from "react";
import { partnerRoman, partnerSerif, partnerWide } from "../lib/partner-fonts";

// Same classes as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

type Partner = {
  name: string;
  /** Soft gray shape behind the word (decorative). */
  backdrop: ReactNode;
  wordClass: string;
};

const PARTNERS: Partner[] = [
  {
    name: "BOSCH",
    // Diagonal brush-like bar.
    backdrop: (
      <span className="absolute top-1/2 left-1/2 h-[70%] w-[78%] -translate-x-1/2 -translate-y-1/2 -rotate-[24deg] rounded-[40%_12%_45%_10%] bg-faint/25" />
    ),
    wordClass: `${partnerSerif.className} text-[26px] leading-none tracking-[-0.01em] sm:text-4xl lg:text-[44px]`,
  },
  {
    name: "MAGICUT",
    // Thin ring.
    backdrop: (
      <span className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-faint/35 sm:size-24 lg:size-28" />
    ),
    wordClass: `${partnerRoman.className} pl-[0.22em] text-xs leading-none tracking-[0.22em] sm:text-xl sm:tracking-[0.28em] sm:pl-[0.28em] lg:text-[26px]`,
  },
  {
    name: "KPT",
    // Rounded square tile.
    backdrop: (
      <span className="absolute top-1/2 left-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rotate-[4deg] rounded-[10px] bg-faint/20 sm:size-20 lg:size-24" />
    ),
    wordClass: `${partnerWide.className} pl-[0.18em] text-xl leading-none tracking-[0.18em] sm:text-3xl lg:text-[38px]`,
  },
];

/** "Our Partners": brand names set as black-and-white text marks, centered in one row. */
export default function PartnersSection() {
  return (
    <section aria-labelledby="partners-heading" className="py-6 lg:py-10">
      <div className={CONTAINER}>
        <div className="flex items-center gap-4 lg:gap-6">
          <span aria-hidden className="h-px flex-1 bg-line" />
          <h2
            id="partners-heading"
            className="text-xs font-semibold tracking-[0.32em] text-muted uppercase lg:text-sm"
          >
            Our Partners
          </h2>
          <span aria-hidden className="h-px flex-1 bg-line" />
        </div>

        <ul className="mx-auto mt-6 grid max-w-5xl grid-cols-3 items-center divide-x divide-line lg:mt-10">
          {PARTNERS.map((p) => (
            <li
              key={p.name}
              className="group flex h-24 items-center justify-center sm:h-32 lg:h-40"
            >
              <span className="relative inline-flex items-center justify-center px-2 py-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
                <span aria-hidden className="pointer-events-none">
                  {p.backdrop}
                </span>
                <span
                  className={`relative text-text/85 uppercase transition-colors duration-300 group-hover:text-text ${p.wordClass}`}
                >
                  {p.name}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
