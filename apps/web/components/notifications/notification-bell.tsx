"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CircleAlert, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useSessionUser } from "../../lib/auth/user-context";
import type { NotificationItem as Item } from "../../lib/notifications/notification-service";
import NotificationItem from "./notification-item";

/** Unread count refresh while the tab is open (spec 016). */
const REFRESH_MS = 60_000;
const DESKTOP = "(min-width: 1024px)";

const FOCUS_ON_LIGHT =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";
const FOCUS_ON_DARK =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface";
const PRIMARY = `inline-flex h-11 items-center justify-center rounded-pill bg-brand-950 px-6 text-[15px] font-semibold text-surface hover:bg-brand-900 ${FOCUS_ON_LIGHT}`;

type Status = "idle" | "loading" | "ready" | "error" | "logged-out";

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const badgeText = (n: number) => (n >= 10 ? "9+" : String(n));

type NotificationBellProps = {
  /**
   * "header": icon in the desktop header, panel below it.
   * "tab": the mobile tab bar item, full-width sheet above the tab bar.
   * Only the one visible at the current width polls for updates.
   */
  variant: "header" | "tab";
};

/**
 * Notification bell (spec 016): unread badge ("9+" from 10), panel with the 10
 * newest notifications, and empty, logged-out, loading and error states. The
 * count comes with the page (server) and refreshes every 60 seconds; opening
 * the panel reloads the list and marks the visible items read.
 */
export default function NotificationBell({ variant }: NotificationBellProps) {
  const user = useSessionUser();
  const pathname = usePathname() ?? "/";
  const isDesktop = useMediaQuery(DESKTOP);
  const active = variant === "header" ? isDesktop : !isDesktop;

  // Server count; follows new values after navigation (login, logout, refresh).
  const initial = user?.unreadNotifications ?? 0;
  const [unread, setUnread] = useState(initial);
  const [seenInitial, setSeenInitial] = useState(initial);
  if (seenInitial !== initial) {
    setSeenInitial(initial);
    setUnread(initial);
  }

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [items, setItems] = useState<Item[]>([]);
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close when the page changes.
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
  }

  const markRead = useCallback((body: { ids: string[] } | { all: true }) => {
    // keepalive: still sent when a row click navigates away.
    void fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => null);
  }, []);

  const load = useCallback(
    async ({ showSkeleton, markVisible }: { showSkeleton: boolean; markVisible: boolean }) => {
      if (showSkeleton) setStatus("loading");
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (res.status === 401) {
          setStatus("logged-out");
          setUnread(0);
          return;
        }
        if (!res.ok) throw new Error("request failed");
        const data = (await res.json()) as { notifications: Item[]; unreadCount: number };
        setItems(data.notifications);
        setStatus("ready");
        const unreadIds = data.notifications.filter((n) => !n.isRead).map((n) => n.id);
        if (markVisible && unreadIds.length > 0) {
          markRead({ ids: unreadIds });
          setUnread(Math.max(0, data.unreadCount - unreadIds.length));
        } else {
          setUnread(data.unreadCount);
        }
      } catch {
        // A background refresh keeps what is on screen; an open panel shows the error.
        if (showSkeleton) setStatus("error");
      }
    },
    [markRead],
  );

  // Refresh every 60s (and when the tab becomes visible), only for the visible bell.
  useEffect(() => {
    if (!user || !active) return;
    const tick = () => {
      if (document.visibilityState === "visible") void load({ showSkeleton: false, markVisible: false });
    };
    const timer = window.setInterval(tick, REFRESH_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [user, active, load]);

  // Escape or a click outside closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (!user) {
      setStatus("logged-out");
      return;
    }
    // Skeleton only when there is nothing to show yet; otherwise refresh in place.
    void load({ showSkeleton: status !== "ready", markVisible: true });
  };

  const onOpenItem = (item: Item) => {
    if (!item.isRead) markRead({ ids: [item.id] });
    setOpen(false);
  };

  const showBadge = user !== null && unread > 0;
  const label = showBadge ? `Notifications, ${unread} unread` : "Notifications";

  const badge = showBadge && (
    <span
      aria-hidden
      className="absolute -top-1.5 -right-2 grid h-[18px] min-w-[18px] place-items-center rounded-pill bg-badge px-1 text-[11px] leading-none font-semibold text-brand-950"
    >
      {badgeText(unread)}
    </span>
  );

  const panel = (
    <div className="text-left text-text">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-base font-semibold text-text">Notifications</h2>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            triggerRef.current?.focus();
          }}
          aria-label="Close notifications"
          className={`grid size-8 place-items-center rounded-pill text-muted hover:bg-well hover:text-text ${FOCUS_ON_LIGHT}`}
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
      <PanelBody
        status={status}
        items={items}
        loginHref={`/login?next=${encodeURIComponent(pathname)}`}
        onRetry={() => void load({ showSkeleton: true, markVisible: true })}
        onOpenItem={onOpenItem}
      />
    </div>
  );

  if (variant === "tab") {
    return (
      <div ref={wrapRef}>
        <button
          ref={triggerRef}
          type="button"
          onClick={toggle}
          aria-label={label}
          aria-expanded={open}
          aria-controls={panelId}
          className={`flex min-w-11 flex-col items-center gap-1 rounded-md text-[11px] leading-[14px] ${FOCUS_ON_LIGHT} ${
            open ? "text-brand-700" : "text-body hover:text-brand-700"
          }`}
        >
          <span className="relative">
            <Bell aria-hidden className="size-[22px]" />
            {badge}
          </span>
          Notifications
        </button>
        {open && (
          <>
            <button
              type="button"
              aria-label="Close notifications"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 cursor-default bg-text/40"
            />
            <div
              id={panelId}
              role="dialog"
              aria-label="Notifications"
              className="fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-50 max-h-[75dvh] overflow-y-auto rounded-t-banner border-t border-line bg-surface shadow-lg"
            >
              {panel}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        className={`relative grid size-10 place-items-center rounded-md text-surface hover:text-brand-100 ${FOCUS_ON_DARK}`}
      >
        <Bell aria-hidden strokeWidth={1.75} className="size-6" />
        {badge}
      </button>
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className="absolute top-full right-0 z-50 mt-3 max-h-[min(560px,80dvh)] w-[380px] overflow-y-auto rounded-card border border-line bg-surface shadow-lg"
        >
          {panel}
        </div>
      )}
    </div>
  );
}

function PanelBody({
  status,
  items,
  loginHref,
  onRetry,
  onOpenItem,
}: {
  status: Status;
  items: Item[];
  loginHref: string;
  onRetry: () => void;
  onOpenItem: (item: Item) => void;
}) {
  if (status === "logged-out") {
    return (
      <div className="px-4 py-8 text-center">
        <Bell aria-hidden className="mx-auto size-8 text-faint" />
        <p className="mt-3 text-[15px] text-body">Login to see your notifications</p>
        <Link href={loginHref} className={`mt-4 ${PRIMARY}`}>
          Login
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div role="alert" className="px-4 py-8 text-center">
        <CircleAlert aria-hidden className="mx-auto size-8 text-brand-950" />
        <p className="mt-3 text-[15px] text-body">Could not load notifications</p>
        <button type="button" onClick={onRetry} className={`mt-4 ${PRIMARY}`}>
          Try again
        </button>
      </div>
    );
  }

  if (status !== "ready") {
    return (
      <ul aria-busy="true" aria-label="Loading notifications" className="divide-y divide-line">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex gap-3 px-4 py-3 pl-6">
            <span className="size-9 shrink-0 animate-pulse rounded-pill bg-well motion-reduce:animate-none" />
            <span className="flex-1 space-y-2 py-1">
              <span className="block h-3 w-3/4 animate-pulse rounded-pill bg-well motion-reduce:animate-none" />
              <span className="block h-3 w-1/2 animate-pulse rounded-pill bg-well motion-reduce:animate-none" />
            </span>
          </li>
        ))}
      </ul>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <Bell aria-hidden className="mx-auto size-8 text-faint" />
        <h3 className="mt-3 text-base font-semibold text-text">No notifications yet</h3>
        <p className="mt-1 text-sm text-muted">Order updates and new products will appear here.</p>
        <Link href="/products" className={`mt-4 ${PRIMARY}`}>
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.id}>
          <NotificationItem item={item} onOpen={onOpenItem} />
        </li>
      ))}
    </ul>
  );
}
