"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  BadgeCheck,
  CreditCard,
  Globe,
  Headset,
  Mail,
  Send,
  ShieldCheck,
  Smartphone,
  Star,
  Truck,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Data (layout from docs/design/reference/Footer.png)                 */
/* ------------------------------------------------------------------ */

type FooterLink = { label: string; href: string };
type LinkGroup = { title: string; links: FooterLink[] };

// Destination pages don't exist yet, so every link is "#" for now.
const LINK_GROUPS: LinkGroup[] = [
  {
    title: "Company",
    links: [
      { label: "About us", href: "#" },
      { label: "Reviews", href: "#" },
      { label: "Privacy policy", href: "#" },
      { label: "Cookie policy", href: "#" },
      { label: "Terms & conditions", href: "#" },
      { label: "Acceptable use policy", href: "#" },
      { label: "Sitemap", href: "#" },
    ],
  },
  {
    title: "Shipping services",
    links: [
      { label: "Ship a package", href: "#" },
      { label: "Track a package", href: "#" },
      { label: "Domestic shipping", href: "#" },
      { label: "International shipping", href: "#" },
      { label: "Bulk shipping", href: "#" },
      { label: "Couriers", href: "#" },
      { label: "Delivery services", href: "#" },
    ],
  },
  {
    title: "Customers",
    links: [
      { label: "Log in", href: "#" },
      { label: "Register", href: "#" },
      { label: "Contact us", href: "#" },
      { label: "Support hub", href: "#" },
      { label: "Preferences", href: "#" },
    ],
  },
];

// Our own rating (DESIGN.md "Customer Reviews": 4.8). Not a third-party score.
const RATING = { score: 4.8, outOf: 5, label: "Customer rating" };

const TRUST_ITEMS: { icon: LucideIcon; top: string; bottom: string }[] = [
  { icon: Truck, top: "Fast delivery to", bottom: "INDIA" },
  { icon: ShieldCheck, top: "100% secure", bottom: "Checkout" },
  { icon: Headset, top: "Expert", bottom: "Assistance" },
  { icon: BadgeCheck, top: "Genuine", bottom: "Products" },
];

// Accepted payment methods (text badges; no third-party logo files).
const PAYMENT_METHODS: { label: string; icon?: LucideIcon }[] = [
  { label: "VISA" },
  { label: "Mastercard", icon: CreditCard },
  { label: "G Pay" },
  { label: "PhonePe", icon: Smartphone },
];

const COPYRIGHT = "Copyright © 2026 | All Rights Reserved";

/* ------------------------------------------------------------------ */
/* Shared class names                                                  */
/* ------------------------------------------------------------------ */

// Same as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

const FOCUS_ON_LIGHT =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

/* ------------------------------------------------------------------ */
/* Newsletter band                                                     */
/* ------------------------------------------------------------------ */

function Newsletter() {
  // No backend yet: confirm on screen only, nothing is stored or sent.
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <></>
  );
}

/* ------------------------------------------------------------------ */
/* Brand + rating                                                      */
/* ------------------------------------------------------------------ */

function RatingStars({ score, outOf }: { score: number; outOf: number }) {
  return (
    <div aria-hidden className="flex gap-1">
      {Array.from({ length: outOf }, (_, i) => {
        const fill = Math.max(0, Math.min(1, score - i)); // 0..1 for this star
        return (
          <span
            key={i}
            className="relative grid size-8 place-items-center overflow-hidden bg-line"
          >
            <span
              className="absolute inset-y-0 left-0 bg-success"
              style={{ width: `${fill * 100}%` }}
            />
            <Star className="relative size-5 fill-surface text-surface" />
          </span>
        );
      })}
    </div>
  );
}

function BrandColumn() {
  return (
    <div className="flex flex-col gap-6 lg:gap-12">
      {/* The logo has white lettering, so it sits on a navy tile. */}
      <Link
        href="/"
        aria-label="Tools Solutions home"
        className={`inline-flex w-fit rounded-card bg-brand-950 px-4 py-2 ${FOCUS_ON_LIGHT}`}
      >
        <Image
          src="/images/logo/DesktopLogo.png"
          alt="Tools Solutions"
          width={2172}
          height={724}
          className="h-12 w-auto"
        />
      </Link>

      <div>
        <p className="text-xl font-semibold text-brand-950">{RATING.label}</p>
        <div className="mt-2">
          <RatingStars score={RATING.score} outOf={RATING.outOf} />
        </div>
        <p className="mt-2 text-[15px] text-body">
          <span className="sr-only">Rated </span>
          {RATING.score} out of {RATING.outOf}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Link columns                                                        */
/* ------------------------------------------------------------------ */

function LinkColumn({ group }: { group: LinkGroup }) {
  const id = `footer-${group.title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <nav aria-labelledby={id}>
      <h2
        id={id}
        className="mb-3 text-base font-semibold text-brand-950 lg:text-lg"
      >
        {group.title}
      </h2>
      <ul className="space-y-0.5">
        {group.links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className={`inline-flex min-h-8 items-center rounded-sm text-[15px] text-body hover:text-brand-700 hover:underline ${FOCUS_ON_LIGHT}`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Trust strip                                                         */
/* ------------------------------------------------------------------ */

function TrustStrip() {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-6 border-y border-brand-200 py-6 lg:grid-cols-4 lg:py-8">
      {TRUST_ITEMS.map(({ icon: Icon, top, bottom }) => (
        <li
          key={bottom}
          className="flex items-center gap-3 lg:justify-center lg:gap-4"
        >
          <Icon
            aria-hidden
            strokeWidth={1.75}
            className="size-8 shrink-0 text-brand-950 lg:size-10"
          />
          <p className="text-sm leading-tight text-brand-950 uppercase lg:text-base">
            <span className="block">{top}</span>
            <span className="block">{bottom}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Bottom bar                                                          */
/* ------------------------------------------------------------------ */

function BottomBar() {
  return (
    <div className="flex flex-col gap-5 py-6 lg:flex-row lg:items-center lg:justify-between lg:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* Display-only region indicator (no region switching in v1). */}
        <p className="flex w-fit items-center gap-3 rounded-sm border border-brand-200 bg-surface px-3 py-2 text-[15px] text-text">
          <span aria-hidden className="text-lg leading-none">
            🇮🇳
          </span>
          <span>
            <span className="sr-only">Region: </span>India
          </span>
          <Globe aria-hidden className="size-5 text-body" />
        </p>
        <p className="text-sm text-muted">{COPYRIGHT}</p>
      </div>

      <div>
        <p className="sr-only">We accept</p>
        <ul className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map(({ label, icon: Icon }) => (
            <li
              key={label}
              className="flex h-9 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-sm text-brand-900 shadow-sm"
            >
              {Icon && <Icon aria-hidden className="size-4" />}
              <span className={label === "VISA" ? "italic" : undefined}>
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export function Footer() {
  return (
    <footer className="bg-gray-50">
      <Newsletter />
      <div className={CONTAINER}>
        <div className="grid gap-8 py-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-6 lg:py-14">
          <BrandColumn />
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:contents">
            {LINK_GROUPS.map((group) => (
              <LinkColumn key={group.title} group={group} />
            ))}
          </div>
        </div>
        <TrustStrip />
        <BottomBar />
      </div>
    </footer>
  );
}

export default Footer;
