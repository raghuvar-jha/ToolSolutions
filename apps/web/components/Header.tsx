"use client";

import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Heart,
  LocateFixed,
  MapPin,
  Phone,
  Search,
  ShoppingCart,
  Truck,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";
import CategoryMenu from "./CategoryMenu";
import { useCart } from "../lib/cart/cart-context";
import { CATEGORIES, categoryHref } from "../lib/categories";

/*
 * Site header. Layout: DESIGN.md §5 "Header" (desktop, per Navbar.png)
 * and §6 (mobile).
 */

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

// Hardcoded until a saved list exists. The cart count is live (useCart).
const SAVED_COUNT: number = 0;

// Display-only delivery info (no geolocation in v1).
const DELIVERY_AREA = "INDIA";
const DELIVERY_TIME = "1 Day";

// Desktop nav shows this many categories inline; the rest go under "More".
const VISIBLE_CATEGORIES = 6;

// TODO: switch to a tel: link once the client provides the order phone number.
const ORDER_NOW_HREF = "/contact";

/* ------------------------------------------------------------------ */
/* Shared class names                                                  */
/* ------------------------------------------------------------------ */

// Same as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

const FOCUS_ON_LIGHT =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";
const FOCUS_ON_DARK =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface";

const itemsLabel = (n: number) => `${n} ${n === 1 ? "item" : "items"}`;

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

function Logo({ className }: { className: string }) {
  // The PNG has ~20% transparent padding top and bottom, so the visible
  // mark is ~60% of the rendered height (h-14 ≈ 32px visible, per spec).
  return (
    <Link
      href="/"
      aria-label="Tools Solutions home"
      className={`shrink-0 rounded-md ${FOCUS_ON_DARK}`}
    >
      <Image
        src="/images/logo/DesktopLogo.png"
        alt="Tools Solutions"
        width={2172}
        height={724}
        loading="eager"
        className={`w-auto ${className}`}
      />
    </Link>
  );
}

function SearchInput({
  isDesktop,
  defaultValue,
}: {
  isDesktop: boolean;
  defaultValue: string;
}) {
  return (
    <input
      // New key when the search in the URL changes (back / forward), so the
      // uncontrolled input shows it.
      key={defaultValue}
      type="search"
      name="q"
      required
      defaultValue={defaultValue}
      aria-label="Search tools"
      placeholder="Search by tool, brand, size or model..."
      enterKeyHint="search"
      autoComplete="off"
      className={`h-full min-w-0 flex-1 bg-transparent text-text placeholder:text-faint focus:outline-none ${
        isDesktop ? "px-4 text-base" : "px-3 text-[15px]"
      }`}
    />
  );
}

/** On the listing pages, the header box shows the current search (?q=). */
function CurrentSearchInput({ isDesktop }: { isDesktop: boolean }) {
  const pathname = usePathname() ?? "/";
  const params = useSearchParams();
  const onListing =
    pathname === "/products" || pathname.startsWith("/category/");
  const q = onListing ? (params?.get("q") ?? "").trim() : "";
  return <SearchInput isDesktop={isDesktop} defaultValue={q} />;
}

/** Header search: always searches all products on the listing page (/products?q=). */
function SearchForm({ variant }: { variant: "desktop" | "mobile" }) {
  const isDesktop = variant === "desktop";
  return (
    <Form
      action="/products"
      role="search"
      className={`flex h-11 min-w-0 flex-1 items-center overflow-hidden bg-surface ${
        isDesktop
          ? "max-w-[560px] rounded-lg focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-surface"
          : "rounded-card shadow-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-700"
      }`}
    >
      {!isDesktop && (
        <Search aria-hidden className="ml-3 size-5 shrink-0 text-faint" />
      )}
      {/* useSearchParams needs a Suspense boundary so static pages still pre-render. */}
      <Suspense fallback={<SearchInput isDesktop={isDesktop} defaultValue="" />}>
        <CurrentSearchInput isDesktop={isDesktop} />
      </Suspense>
      <button
        type="submit"
        aria-label="Search"
        className={`m-1 grid shrink-0 place-items-center ${FOCUS_ON_LIGHT} ${
          isDesktop
            ? "h-9 w-11 rounded-md bg-well text-brand-900 hover:bg-brand-50"
            : "size-9 rounded-lg bg-brand-950 text-surface hover:bg-brand-900"
        }`}
      >
        <Search aria-hidden className="size-5" />
      </button>
    </Form>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop row 1 pieces                                                */
/* ------------------------------------------------------------------ */

/** Display-only location pill (no geolocation in v1). */
function LocationPill() {
  return (
    <p className="flex h-7 w-[100px] shrink-0 items-center gap-2 rounded-lg"
    >
      
      <span className="sr-only">Delivering to</span>
      <span className="truncate text-base"></span>
    </p>
  );
}

/** Icon + caption over value (Saved / Account / My cart). */
function ActionContent({
  icon: Icon,
  caption,
  value,
}: {
  icon: LucideIcon;
  caption: string;
  value: string;
}) {
  return (
    <>
      <Icon aria-hidden strokeWidth={1.75} className="size-6 shrink-0" />
      <span className="leading-tight">
        <span className="block text-xs text-brand-200">{caption}</span>
        <span className="block text-base whitespace-nowrap">
          {value}
        </span>
      </span>
    </>
  );
}

/** Cart link label; the count is hidden while the cart is empty (or still loading). */
const cartLabel = (n: number) => (n > 0 ? itemsLabel(n) : "empty");

function HeaderActions() {
  const { itemCount } = useCart();
  return (
    <div className="flex shrink-0 items-center gap-6 text-surface">
      {/* Display-only in v1: no wishlist yet (DESIGN.md §8 #7). */}
      <p className="flex items-center gap-2">
        <ActionContent icon={Heart} caption="Saved" value={itemsLabel(SAVED_COUNT)} />
      </p>
      {/* Goes to signup until login exists (spec 010). */}
      <Link
        href="/signup"
        aria-label="Account, sign in"
        className={`flex items-center gap-2 rounded-md hover:text-brand-100 ${FOCUS_ON_DARK}`}
      >
        <ActionContent icon={User} caption="Account" value="Sign in" />
      </Link>
      <Link
        href="/cart"
        aria-label={`MY CART, ${cartLabel(itemCount)}`}
        className={`flex items-center gap-2 rounded-md hover:text-brand-100 ${FOCUS_ON_DARK}`}
      >
        <ActionContent
          icon={ShoppingCart}
          caption="My cart"
          value={itemCount > 0 ? itemsLabel(itemCount) : "Empty"}
        />
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop row 2: category nav                                         */
/* ------------------------------------------------------------------ */

function DesktopCategoryNav() {
  const visible = CATEGORIES.slice(0, VISIBLE_CATEGORIES);
  const overflow = CATEGORIES.slice(VISIBLE_CATEGORIES);

  return (
    <nav aria-label="Categories" className="flex h-11 items-center gap-6">
      <CategoryMenu
        label="All Tools"
        withMenuIcon
        footerLink={{ label: "View all tools", href: "/products" }}
      />
      <span aria-hidden className="h-6 w-px bg-faint/50" />
      <ul className="flex min-w-0 items-center gap-8">
        {visible.map(({ name, slug }) => (
          <li key={slug}>
            <Link
              href={categoryHref(slug)}
              className={`rounded-md text-base whitespace-nowrap text-text hover:text-brand-700 ${FOCUS_ON_LIGHT}`}
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
      {overflow.length > 0 && (
        <CategoryMenu label="More" slugs={overflow.map((c) => c.slug)} />
      )}
      <Link
        href="/deals"
        className={`ml-auto flex shrink-0 items-center gap-1.5 rounded-md text-base font-semibold text-brand-700 hover:text-brand-800 ${FOCUS_ON_LIGHT}`}
      >
        
        Today&apos;s Deals
      </Link>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile pieces (DESIGN.md §6)                                        */
/* ------------------------------------------------------------------ */

/** Display-only location + delivery pills. */
function MobileDeliveryRow() {
  return (
    <div className="flex items-stretch gap-2">
      <p className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-surface/70 py-1.5 pr-1.5 pl-3 text-text">
        <MapPin aria-hidden className="size-5 shrink-0 text-brand-950" />
        <span className="sr-only">Delivering to</span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
          {DELIVERY_AREA}
        </span>
        <span
          aria-hidden
          className="grid size-8 shrink-0 place-items-center rounded-pill bg-brand-950 text-surface"
        >
          <LocateFixed className="size-4" />
        </span>
      </p>
      <p className="flex shrink-0 items-center gap-2 rounded-2xl bg-success-bg px-3 py-1.5">
        <Truck aria-hidden className="size-5 shrink-0 text-success" />
        <span className="leading-tight">
          <span className="block text-[11px] text-muted">Delivery</span>
          <span className="block text-base font-semibold text-success">
            {DELIVERY_TIME}
          </span>
        </span>
      </p>
    </div>
  );
}

function MobileCartPill() {
  const { itemCount } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${cartLabel(itemCount)}`}
      className={`flex h-11 shrink-0 items-center gap-1.5 rounded-card bg-surface px-3 text-text shadow-sm ${FOCUS_ON_LIGHT}`}
    >
      <ShoppingCart aria-hidden className="size-5" />
      {itemCount > 0 && (
        <span aria-hidden className="text-base font-semibold">
          {itemCount}
        </span>
      )}
    </Link>
  );
}

// Mobile strip: a fixed row (no sideways scroll), so at most 5 categories,
// with short labels that fit a 390px screen. Each short label is the start of
// the full name, which links keep as their accessible name.
const MOBILE_CATEGORIES = 5;
const MOBILE_SHORT_LABELS: Record<string, string> = {
  "cutting-drilling": "Cutting",
  "power-tools": "Power",
  measuring: "Measuring",
  safety: "Safety",
  clamping: "Clamping",
};

function MobileCategoryStrip() {
  const pathname = usePathname() ?? "/";

  return (
    <nav aria-label="Categories">
      <ul className="grid grid-cols-5 pb-1">
        {CATEGORIES.slice(0, MOBILE_CATEGORIES).map(
          ({ name, slug, icon: Icon }) => {
            const href = categoryHref(slug);
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={slug} className="flex justify-center">
                <Link
                  href={href}
                  aria-label={name}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-w-14 flex-col items-center gap-1.5 rounded-card border-b-[3px] px-2 pt-1.5 pb-1.5 text-[13px] whitespace-nowrap text-text transition-colors ${FOCUS_ON_LIGHT} ${
                    active
                      ? "border-brand-950 bg-surface/30 inset-shadow-sm inset-shadow-brand-950/15"
                      : "border-transparent hover:bg-surface/20"
                  }`}
                >
                  <Icon aria-hidden strokeWidth={1.5} className="size-7" />
                  {MOBILE_SHORT_LABELS[slug] ?? name}
                </Link>
              </li>
            );
          },
        )}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

export function SiteHeader() {
  return (
    <header>
      {/* ---------- Desktop (lg+) ---------- */}
      <div className="hidden lg:block">
        {/* Row 1: main bar */}
        <div className="bg-linear-to-r from-brand-950 via-brand-900 to-brand-500">
          <div className={`${CONTAINER} flex h-18 items-center gap-4`}>
            <Logo className="h-14" />
            <LocationPill />
            <SearchForm variant="desktop" />
            <div className="ml-auto pl-4">
              <HeaderActions />
            </div>
          </div>
        </div>

        {/* Row 2: category nav */}
        <div className="relative z-40 border-b border-line bg-surface shadow-sm">
          <div className={CONTAINER}>
            <DesktopCategoryNav />
          </div>
        </div>
      </div>

      {/* ---------- Mobile (< lg) ---------- */}
      <div className="lg:hidden">
        <div className="bg-brand-950">
          <div className={`${CONTAINER} flex h-12 items-center justify-between gap-3`}>
            <Logo className="h-11" />
            <Link
              href={ORDER_NOW_HREF}
              className={`flex shrink-0 items-center gap-1.5 rounded-md text-sm font-semibold text-surface uppercase ${FOCUS_ON_DARK}`}
            >
              <Phone aria-hidden className="size-4 text-footer-icon" />
              Order now
            </Link>
          </div>
        </div>

        <div className="bg-linear-to-b from-sky-start via-sky-mid to-surface">
          <div className={`${CONTAINER} space-y-3 pt-3`}>
            <MobileDeliveryRow />
            <div className="flex items-center gap-2">
              <SearchForm variant="mobile" />
              <MobileCartPill />
            </div>
            <MobileCategoryStrip />
          </div>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
