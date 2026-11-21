"use client";

import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import {
  Heart,
  LocateFixed,
  LogOut,
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
import CountBadge from "./count-badge";
import NotificationBell from "./notifications/notification-bell";
import { useCart } from "../lib/cart/cart-context";
import { CATEGORIES, categoryHref } from "../lib/categories";
import { useSaved } from "../lib/saved/saved-context";
import { useSessionUser } from "../lib/auth/user-context";

/*
 * Site header. Layout: DESIGN.md §5 "Header" (desktop, per Navbar.png)
 * and §6 (mobile).
 */

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

// Display-only delivery info (no geolocation in v1).
const DELIVERY_AREA = "INDIA";
const DELIVERY_TIME = "1 Day";

// Desktop nav shows this many categories inline; the rest go under "More".
const VISIBLE_CATEGORIES = 6;

/** "Order now" calls the order line directly (client number). */
const ORDER_PHONE = "+919811224990";
const ORDER_PHONE_LABEL = "+91 98112 24990";

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

/** Icon + caption over value (Saved / Account / My cart), with an optional count badge on the icon. */
function ActionContent({
  icon: Icon,
  caption,
  value,
  badge,
}: {
  icon: LucideIcon;
  caption: string;
  value: string;
  badge?: { count: number; loaded: boolean };
}) {
  return (
    <>
      <span className="relative shrink-0">
        <Icon aria-hidden strokeWidth={1.75} className="size-6" />
        {badge && <CountBadge {...badge} />}
      </span>
      <span className="leading-tight">
        <span className="block text-xs text-brand-200">{caption}</span>
        <span className="block text-base whitespace-nowrap">
          {value}
        </span>
      </span>
    </>
  );
}

/** /login?next=<this page>, so logging in comes back here (not from the auth pages themselves). */
function useLoginHref() {
  const pathname = usePathname();
  return pathname && !["/login", "/signup"].includes(pathname)
    ? `/login?next=${encodeURIComponent(pathname)}`
    : "/login";
}

/** POST /logout (spec 013). A form, so it works without JavaScript and can't be triggered by a link. */
function LogoutButton({ className, children, label }: { className: string; children: ReactNode; label?: string }) {
  return (
    <form action="/logout" method="post" className="inline">
      <button type="submit" aria-label={label} className={className}>
        {children}
      </button>
    </form>
  );
}

/** Desktop account block: Login / Register, or the first name and Logout (spec 013). */
function AccountAction() {
  const user = useSessionUser();
  const loginHref = useLoginHref();
  const link = `rounded-sm hover:text-brand-100 ${FOCUS_ON_DARK}`;
  return (
    <div className="flex items-center gap-3.5">
      <User aria-hidden strokeWidth={1.75} className="size-6 shrink-0" />
      <span className="leading-tight">
        <span className="block text-xs text-brand-200">Account</span>
        <span className="flex items-baseline gap-1.5 text-base whitespace-nowrap">
          {user ? (
            <>
              <Link href="/account" className={`max-w-32 truncate ${link}`}>
                {user.firstName}
              </Link>
              <span aria-hidden className="text-brand-200">/</span>
              <LogoutButton className={`cursor-pointer ${link}`}>Logout</LogoutButton>
            </>
          ) : (
            <>
              <Link href={loginHref} className={link}>
                Login
              </Link>
              <span aria-hidden className="text-brand-200">/</span>
              <Link href="/signup" className={link}>
                Register
              </Link>
            </>
          )}
        </span>
      </span>
    </div>
  );
}

/**
 * Mobile top bar: "Login", or an account icon and a Logout icon (spec 013).
 * Icons only when logged in, so the bar fits next to the logo and "Order now"
 * down to 320px; the first name is in the account link's accessible label.
 */
function MobileAccount() {
  const user = useSessionUser();
  const loginHref = useLoginHref();
  const icon = `grid size-8 shrink-0 cursor-pointer place-items-center rounded-md text-surface ${FOCUS_ON_DARK}`;
  if (!user) {
    return (
      <Link
        href={loginHref}
        className={`flex shrink-0 items-center gap-1.5 rounded-md text-sm text-surface ${FOCUS_ON_DARK}`}
      >
        <User aria-hidden className="size-4 text-footer-icon" />
        Login
      </Link>
    );
  }
  return (
    <span className="flex shrink-0 items-center gap-1">
      <Link href="/account" aria-label={`Account, ${user.firstName}`} title={user.firstName} className={icon}>
        <User aria-hidden className="size-5 text-footer-icon" />
      </Link>
      <LogoutButton label="Logout" className={icon}>
        <LogOut aria-hidden className="size-4" />
      </LogoutButton>
    </span>
  );
}

/** Cart link label; the count is hidden while the cart is empty (or still loading). */
const cartLabel = (n: number) => (n > 0 ? itemsLabel(n) : "empty");

function HeaderActions() {
  const { itemCount, loaded: cartLoaded } = useCart();
  const { count: savedCount, loaded: savedLoaded } = useSaved();
  return (
    <div className="flex shrink-0 items-center gap-7 text-surface">
      {/* Spec 016: unread count from the server (root layout), refreshed every 60s. */}
      <NotificationBell variant="header" />
      <Link
        href="/saved"
        aria-label={`Saved, ${itemsLabel(savedCount)}`}
        className={`flex items-center gap-3.5 rounded-md hover:text-brand-100 ${FOCUS_ON_DARK}`}
      >
        <ActionContent
          icon={Heart}
          caption="Saved"
          value={itemsLabel(savedCount)}
          badge={{ count: savedCount, loaded: savedLoaded }}
        />
      </Link>
      <AccountAction />
      <Link
        href="/cart"
        aria-label={`MY CART, ${cartLabel(itemCount)}`}
        className={`flex items-center gap-3.5 rounded-md hover:text-brand-100 ${FOCUS_ON_DARK}`}
      >
        <ActionContent
          icon={ShoppingCart}
          caption="My cart"
          value={itemCount > 0 ? itemsLabel(itemCount) : "Empty"}
          badge={{ count: itemCount, loaded: cartLoaded }}
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
        href="/products"
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

const MOBILE_PILL = `relative grid size-11 shrink-0 place-items-center rounded-card bg-surface text-text shadow-sm ${FOCUS_ON_LIGHT}`;

/** Mobile icon pills next to the search box; the badge sits on the pill's corner. */
function MobileSavedPill() {
  const { count, loaded } = useSaved();
  return (
    <Link href="/saved" aria-label={`Saved, ${itemsLabel(count)}`} className={MOBILE_PILL}>
      <Heart aria-hidden className="size-5" />
      <CountBadge count={count} loaded={loaded} hideZero />
    </Link>
  );
}

function MobileCartPill() {
  const { itemCount, loaded } = useCart();
  return (
    <Link href="/cart" aria-label={`Cart, ${cartLabel(itemCount)}`} className={MOBILE_PILL}>
      <ShoppingCart aria-hidden className="size-5" />
      <CountBadge count={itemCount} loaded={loaded} />
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
                      ? ""
                      : "border-transparent hover:bg-surface/10"
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
            <div className="flex min-w-0 items-center gap-2 min-[360px]:gap-3">
              <MobileAccount />
              {/* Calls the order line. Below 360px only the phone icon shows (label stays for screen readers). */}
              <a
                href={`tel:${ORDER_PHONE}`}
                aria-label={`Order now, call ${ORDER_PHONE_LABEL}`}
                className={`flex h-8 min-w-8 shrink-0 items-center justify-center gap-1.5 rounded-md text-sm font-semibold text-surface uppercase ${FOCUS_ON_DARK}`}
              >
                <Phone aria-hidden className="size-4 text-footer-icon" />
                <span aria-hidden className="hidden min-[360px]:inline">
                  Order now
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-b from-sky-start via-sky-mid to-surface">
          <div className={`${CONTAINER} space-y-3 pt-3`}>
           
            <div className="flex items-center gap-2">
              <SearchForm variant="mobile" />
              <MobileSavedPill />
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
