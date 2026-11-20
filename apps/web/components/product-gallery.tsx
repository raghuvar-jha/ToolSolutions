"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";

type ProductGalleryProps = {
  images: string[];
  name: string;
};

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

/**
 * Main image + thumbnail row (DESIGN.md §5 PDP gallery, layout per
 * product-page-layout-reference.png). Thumbnail click swaps the main image;
 * ←/→ (and Home/End) move through images while focus is in the gallery.
 */
export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = images.length;
  const hasThumbs = count > 1;

  const go = (next: number) => {
    const clamped = (next + count) % count;
    setIndex(clamped);
    // Keep focus on the thumbnails when the user is moving through them.
    if (thumbRefs.current.includes(document.activeElement as HTMLButtonElement)) {
      thumbRefs.current[clamped]?.focus();
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!hasThumbs) return;
    const keys: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: count - 1,
    };
    if (e.key in keys) {
      e.preventDefault();
      go(keys[e.key]!);
    }
  };

  return (
    <div
      role="group"
      aria-roledescription="image gallery"
      aria-label={`${name} images`}
      onKeyDown={onKeyDown}
    >
      <div
        // Focusable so arrow keys work without first tabbing to a thumbnail.
        tabIndex={hasThumbs ? 0 : undefined}
        aria-label={
          hasThumbs
            ? `Image ${index + 1} of ${count}. Use the arrow keys to change image.`
            : undefined
        }
        className={`relative aspect-square overflow-hidden rounded-banner bg-well ${FOCUS}`}
      >
        <Image
          src={images[index]!}
          alt={`${name}${hasThumbs ? `, image ${index + 1} of ${count}` : ""}`}
          fill
          priority
          sizes="(min-width: 1280px) 620px, (min-width: 1024px) 50vw, 100vw"
          className="object-contain p-8"
        />
      </div>

      {hasThumbs && (
        <>
          <p aria-live="polite" className="sr-only">
            Image {index + 1} of {count}
          </p>
          <ul
            className="mt-4 grid gap-3 lg:mt-8 lg:gap-8"
            style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
          >
            {images.map((src, i) => {
              const active = i === index;
              return (
                <li key={`${src}-${i}`}>
                  <button
                    ref={(el) => {
                      thumbRefs.current[i] = el;
                    }}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Show image ${i + 1} of ${count}`}
                    aria-current={active ? "true" : undefined}
                    tabIndex={active ? 0 : -1}
                    className={`relative block aspect-square w-full overflow-hidden rounded-card bg-well transition-shadow ${FOCUS} ${
                      active
                        ? "ring-2 ring-brand-700"
                        : "ring-1 ring-line hover:ring-brand-200"
                    }`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 200px, 30vw"
                      className="object-contain p-3"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
