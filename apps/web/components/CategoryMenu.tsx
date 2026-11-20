"use client";

import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { CATEGORIES, categoryHref } from "../lib/categories";

type Props = {
  label: string;
  /**
   * Slugs of the categories to list (default: all). Plain strings, because
   * a server component can't pass the Lucide icon components across.
   */
  slugs?: string[];
  /** Show the hamburger icon before the label ("All Tools" button). */
  withMenuIcon?: boolean;
  /** Extra links appended after the categories (e.g. "View all tools"). */
  footerLink?: { label: string; href: string };
};

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

/** Dropdown list of categories for the desktop nav row (DESIGN.md §5 Header, row 2). */
export default function CategoryMenu({
  label,
  slugs,
  withMenuIcon = false,
  footerLink,
}: Props) {
  const items = slugs
    ? CATEGORIES.filter((c) => slugs.includes(c.slug))
    : CATEGORIES;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(e) => {
        // Close when keyboard focus leaves the whole menu.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-11 items-center gap-2 rounded-md text-base font-medium whitespace-nowrap text-text hover:text-brand-700 ${FOCUS}`}
      >
        {withMenuIcon && <Menu aria-hidden className="size-5" />}
        {label}
        <ChevronDown
          aria-hidden
          className={`size-4 transition-transform motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute top-full left-0 z-50 mt-1 w-64 rounded-card border border-line bg-surface p-2 shadow-lg"
      >
        <ul>
          {items.map(({ name, slug, icon: Icon }) => (
            <li key={slug}>
              <Link
                href={categoryHref(slug)}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium text-text hover:bg-brand-50 hover:text-brand-700 ${FOCUS}`}
              >
                <Icon aria-hidden strokeWidth={1.5} className="size-5 text-brand-700" />
                {name}
              </Link>
            </li>
          ))}
        </ul>
        {footerLink && (
          <Link
            href={footerLink.href}
            onClick={() => setOpen(false)}
            className={`mt-1 block border-t border-line px-3 pt-2.5 pb-1.5 text-[15px] font-semibold text-brand-700 hover:text-brand-800 ${FOCUS}`}
          >
            {footerLink.label}
          </Link>
        )}
      </div>
    </div>
  );
}
