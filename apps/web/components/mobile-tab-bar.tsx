"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  House,
  LayoutGrid,
  ShoppingCart,
  User,
  type LucideIcon,
} from "lucide-react";

/**
 * Fixed bottom tab bar, mobile only (hidden from lg, where the desktop header
 * takes over). DESIGN.md §6: Home · Category · Notifications · Account · Cart.
 * Notifications and Account are display-only in v1 (§9), so they are not links.
 *
 * Sizes measured from the mobile mock: bar ≈59px + safe-area inset, 22px icons,
 * 11px/500 labels, items spread with equal gaps and 20px side padding.
 */

type Tab = {
  label: string;
  icon: LucideIcon;
  /** Omit for display-only tabs. */
  href?: string;
  /** Route prefixes that make this tab active. */
  match?: (path: string) => boolean;
};

const TABS: Tab[] = [
  { label: "Home", icon: House, href: "/", match: (p) => p === "/" },
  {
    label: "Category",
    icon: LayoutGrid,
    href: "/products",
    match: (p) => p.startsWith("/products") || p.startsWith("/category"),
  },
  { label: "Notifications", icon: Bell },
  { label: "Account", icon: User },
  {
    label: "Cart",
    icon: ShoppingCart,
    href: "/cart",
    match: (p) => p.startsWith("/cart"),
  },
];

const ITEM =
  "flex min-w-11 flex-col items-center gap-1 rounded-md text-[11px] leading-[14px] font-medium";

export default function MobileTabBar() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex h-[59px] items-start justify-between px-5 pt-[11px]">
        {TABS.map(({ label, icon: Icon, href, match }) => {
          const active = !!match?.(pathname);
          const content = (
            <>
              <Icon aria-hidden className="size-[22px]" />
              {label}
            </>
          );
          return (
            <li key={label}>
              {href ? (
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`${ITEM} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 ${
                    active ? "text-brand-700" : "text-body hover:text-brand-700"
                  }`}
                >
                  {content}
                </Link>
              ) : (
                // Display-only in v1 (no notifications or accounts yet).
                <span className={`${ITEM} text-body`}>{content}</span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
