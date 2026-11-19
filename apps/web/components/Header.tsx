import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import {
  Drill,
  HardHat,
  MapPin,
  Ruler,
  Search,
  ShoppingCart,
  Truck,
  User,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Data (kept apart from presentation; move to lib/ when it is shared) */
/* ------------------------------------------------------------------ */

type Category = { name: string; slug: string; icon: LucideIcon };

// v1 list from DESIGN.md §5. Final list pending client confirmation (§8).
const CATEGORIES: Category[] = [
  { name: "Cutting & Drilling", slug: "cutting-drilling", icon: Drill },
  { name: "Power Tools", slug: "power-tools", icon: Zap },
  { name: "Measuring", slug: "measuring", icon: Ruler },
  { name: "Safety", slug: "safety", icon: HardHat },
  { name: "Clamping", slug: "clamping", icon: Wrench },
];

// Hardcoded until cart functionality exists (spec 001).
const CART_COUNT: number = 0;

// Display-only delivery info (no geolocation in v1).
const DELIVERY_AREA = "Noida & NCR";
const DELIVERY_TIME = "1 Day";

/* ------------------------------------------------------------------ */
/* Shared class names                                                  */
/* ------------------------------------------------------------------ */

// Same as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

const FOCUS_ON_LIGHT =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";
const FOCUS_ON_DARK =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface";

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function Logo({ className }: { className: string }) {
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

function SearchForm({ variant }: { variant: "desktop" | "mobile" }) {
  const isDesktop = variant === "desktop";
  return (
    <Form
      action="/search"
      role="search"
      className={`flex min-w-0 flex-1 items-center overflow-hidden bg-surface ${
        isDesktop
          ? "h-11 max-w-xl rounded-lg focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-surface"
          : "h-11 rounded-card shadow-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-700"
      }`}
    >
      <Search aria-hidden className="ml-3 size-5 shrink-0 text-faint" />
      <input
        type="search"
        name="q"
        required
        aria-label="Search tools"
        placeholder={
          isDesktop ? "Search by tool, brand, size or model..." : "Search tools..."
        }
        enterKeyHint="search"
        autoComplete="off"
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] text-text placeholder:text-faint focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className={`grid shrink-0 place-items-center text-surface ${FOCUS_ON_LIGHT} focus-visible:-outline-offset-4 ${
          isDesktop
            ? "h-full w-12 bg-brand-900 hover:bg-brand-950"
            : "m-1 size-9 rounded-lg bg-brand-950 hover:bg-brand-900"
        }`}
      >
        <Search aria-hidden className="size-5" />
      </button>
    </Form>
  );
}

function CartLink({ variant }: { variant: "desktop" | "mobile" }) {
  const label = `Cart, ${CART_COUNT} ${CART_COUNT === 1 ? "item" : "items"}`;

  if (variant === "mobile") {
    return (
      <Link
        href="/cart"
        aria-label={label}
        className={`flex h-11 shrink-0 items-center gap-1.5 rounded-card bg-surface px-3 text-text shadow-sm ${FOCUS_ON_LIGHT}`}
      >
        <ShoppingCart aria-hidden className="size-5" />
        <span aria-hidden className="text-base font-semibold">
          {CART_COUNT}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/cart"
      aria-label={label}
      className={`flex items-center gap-2 rounded-md px-1 py-1 font-semibold text-surface hover:text-brand-100 ${FOCUS_ON_DARK}`}
    >
      <span className="relative">
        <ShoppingCart aria-hidden className="size-6" />
        <span
          aria-hidden
          className="absolute -top-2 -left-2 grid min-w-5 place-items-center rounded-pill bg-surface px-1 text-[11px] leading-5 font-bold text-brand-950"
        >
          {CART_COUNT}
        </span>
      </span>
      <span aria-hidden>Cart</span>
    </Link>
  );
}

function AuthLinks({ variant }: { variant: "desktop" | "mobile" }) {
  const isDesktop = variant === "desktop";
  return (
    <div className="flex shrink-0 items-center gap-2 lg:gap-4">
      <Link
        href="/login"
        className={`flex items-center gap-1.5 rounded-md px-1 py-1 font-semibold text-surface hover:text-brand-100 ${
          isDesktop ? "text-base" : "text-sm"
        } ${FOCUS_ON_DARK}`}
      >
        <User aria-hidden className={isDesktop ? "size-5" : "size-4"} />
        Login
      </Link>
      <Link
        href="/register"
        className={`rounded-lg bg-surface font-semibold text-brand-950 hover:bg-brand-50 ${
          isDesktop ? "px-5 py-2 text-base" : "px-3 py-1.5 text-sm"
        } ${FOCUS_ON_DARK}`}
      >
        Register
      </Link>
    </div>
  );
}

/** Display-only: plain text, not interactive (no geolocation in v1). */
function DeliveryInfoDesktop() {
  return (
    <div className="hidden shrink-0 items-center gap-5 text-surface xl:flex">
      <p className="flex items-center gap-2">
        <MapPin aria-hidden className="size-5 shrink-0" />
        <span className="leading-tight">
          <span className="block text-xs text-brand-100">Delivering to</span>
          <span className="block text-sm font-semibold">{DELIVERY_AREA}</span>
        </span>
      </p>
      <p className="flex items-center gap-2">
        <Truck aria-hidden className="size-5 shrink-0" />
        <span className="leading-tight">
          <span className="block text-xs text-brand-100">Delivery</span>
          <span className="block text-sm font-semibold">{DELIVERY_TIME}</span>
        </span>
      </p>
    </div>
  );
}

/** Display-only pills for mobile. */
function DeliveryInfoMobile() {
  return (
    <div className="flex items-stretch gap-2">
      <p className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-surface/70 px-3 py-2 text-text">
        <MapPin aria-hidden className="size-5 shrink-0 text-brand-950" />
        <span className="min-w-0 leading-tight">
          <span className="block text-[11px] text-body">Delivering to</span>
          <span className="block truncate text-sm font-semibold">
            {DELIVERY_AREA}
          </span>
        </span>
      </p>
      <p className="flex shrink-0 items-center gap-2 rounded-2xl border border-success-bg bg-success-bg px-3 py-2">
        <Truck aria-hidden className="size-5 shrink-0 text-success" />
        <span className="leading-tight">
          <span className="block text-[11px] text-body">Delivery</span>
          <span className="block text-base font-extrabold text-success">
            {DELIVERY_TIME}
          </span>
        </span>
      </p>
    </div>
  );
}

/** One category nav for every width: icon strip on mobile, text row on desktop. */
function CategoryNav() {
  return (
    <nav aria-label="Categories">
      <ul className="-mx-4 flex snap-x gap-1 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:justify-between lg:gap-6 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map(({ name, slug, icon: Icon }) => (
          <li key={slug} className="shrink-0 snap-start">
            <Link
              href={`/category/${slug}`}
              className={`flex min-w-18 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[13px] font-medium whitespace-nowrap text-text hover:bg-surface/60 lg:min-w-0 lg:flex-row lg:px-2 lg:py-4 lg:text-base lg:hover:bg-transparent lg:hover:text-brand-700 ${FOCUS_ON_LIGHT}`}
            >
              <Icon
                aria-hidden
                strokeWidth={1.5}
                className="size-7 lg:hidden"
              />
              {name}
            </Link>
          </li>
        ))}
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
      {/* Mobile: brand bar */}
      <div className="bg-brand-950 lg:hidden">
        <div className={`${CONTAINER} flex h-14 items-center justify-between gap-3`}>
          <Logo className="h-11" />
          <AuthLinks variant="mobile" />
        </div>
      </div>

      {/* Desktop: main bar */}
      <div className="hidden bg-linear-to-r from-brand-950 via-brand-900 to-brand-700 lg:block">
        <div className={`${CONTAINER} flex h-19 items-center gap-6`}>
          <Logo className="h-14" />
          <SearchForm variant="desktop" />
          <div className="ml-auto flex shrink-0 items-center gap-6">
            <DeliveryInfoDesktop />
            <AuthLinks variant="desktop" />
            <CartLink variant="desktop" />
          </div>
        </div>
      </div>

      {/* Mobile: delivery, search and categories on the gradient.
          Desktop: white category bar. */}
      <div className="bg-linear-to-b from-sky-start via-sky-mid to-surface lg:border-b lg:border-line lg:bg-none lg:bg-surface">
        <div className={`${CONTAINER} space-y-3 pt-3 lg:space-y-0 lg:pt-0`}>
          <div className="space-y-3 lg:hidden">
            <DeliveryInfoMobile />
            <div className="flex items-center gap-2">
              <SearchForm variant="mobile" />
              <CartLink variant="mobile" />
            </div>
          </div>
          <CategoryNav />
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
