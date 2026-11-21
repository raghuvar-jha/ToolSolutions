"use client";

import Link from "next/link";
import { Package, Star, Tag, type LucideIcon } from "lucide-react";
import type { NotificationItem as Item } from "../../lib/notifications/notification-service";

const FOCUS =
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-700";

const ICONS: Record<Item["type"], LucideIcon> = {
  ORDER_PLACED: Package,
  ORDER_STATUS: Package,
  REVIEW_PUBLISHED: Star,
  NEW_PRODUCT: Tag,
};

const relative = new Intl.RelativeTimeFormat("en-IN", { numeric: "auto" });

const STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** "2 hours ago", from the server's date and the browser's clock. */
export function timeAgo(iso: string, now = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  for (const [unit, size] of STEPS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

/**
 * One notification row (spec 016): icon by type, bold title, one-line muted body,
 * relative time. Unread rows have a dot and a light primary tint. Clicking marks
 * it read (onOpen) and follows its link.
 */
export default function NotificationItem({ item, onOpen }: { item: Item; onOpen: (item: Item) => void }) {
  const Icon = ICONS[item.type];
  return (
    <Link
      href={item.link}
      onClick={() => onOpen(item)}
      className={`relative flex gap-3 px-4 py-3 pl-6 transition-colors hover:bg-well ${item.isRead ? "bg-surface" : "bg-brand-50"} ${FOCUS}`}
    >
      {!item.isRead && (
        <span aria-hidden className="absolute top-1/2 left-2 size-2 -translate-y-1/2 rounded-pill bg-brand-700" />
      )}
      <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-pill bg-surface text-brand-700 ring-1 ring-line">
        <Icon className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-text">
          {!item.isRead && <span className="sr-only">Unread: </span>}
          {item.title}
        </span>
        {item.body && <span className="block truncate text-sm text-muted">{item.body}</span>}
        <time dateTime={item.createdAt} className="mt-0.5 block text-xs text-muted">
          {timeAgo(item.createdAt)}
        </time>
      </span>
    </Link>
  );
}
