/**
 * Notifications (spec 016). Server only.
 *
 * - Rows are created only by the four notify* functions below (the seed creates none).
 * - Links must be relative paths inside the site; anything else is rejected.
 * - Every read and write is scoped to the user: their own rows, plus broadcasts
 *   (userId null) created after their account (plan decision D4).
 * - Text never includes addresses, payment details, prices or other customers' names.
 */
import type { NotificationType, OrderStatus, Prisma } from "../../generated/prisma/client";
import { productPageHref } from "../catalog/format";
import { db } from "../db";

/** The panel and API show at most this many, newest first. */
export const NOTIFICATION_LIMIT = 10;

const TITLE_MAX = 120;
const BODY_MAX = 300;

/** The app client, or the transaction client inside db().$transaction. */
type Client = Prisma.TransactionClient | ReturnType<typeof db>;

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string;
  /** ISO date from the server. */
  createdAt: string;
  isRead: boolean;
};

/* Link validation ---------------------------------------------------- */

const BASE = "http://site.invalid";

/** True only for a relative path inside the site, e.g. "/orders/abc". */
export function isRelativeLink(link: unknown): link is string {
  if (typeof link !== "string" || link.length === 0 || link.length > 500) return false;
  if (!link.startsWith("/") || link.startsWith("//")) return false;
  if (link.includes("\\") || /[\u0000-\u001f\u007f\s]/.test(link)) return false;
  try {
    const url = new URL(link, BASE);
    // Same origin, and dot segments must not change the path (e.g. "/.//evil.com").
    return url.origin === BASE && `${url.pathname}${url.search}${url.hash}` === link;
  } catch {
    return false;
  }
}

const clip = (text: string, max: number) => (text.length <= max ? text : `${text.slice(0, max - 1)}…`);

async function create(
  client: Client,
  data: {
    type: NotificationType;
    title: string;
    body?: string | null;
    link: string;
    userId: string | null;
    orderId?: string;
    productId?: string;
  },
) {
  if (!isRelativeLink(data.link)) {
    throw new Error("Notification link must be a relative path inside the site.");
  }
  return client.notification.create({
    data: {
      type: data.type,
      title: clip(data.title.trim(), TITLE_MAX),
      body: data.body ? clip(data.body.trim(), BODY_MAX) : null,
      link: data.link,
      userId: data.userId,
      orderId: data.orderId ?? null,
      productId: data.productId ?? null,
    },
    select: { id: true },
  });
}

const orderLink = (orderId: string) => `/orders/${encodeURIComponent(orderId)}`;

/* The four create functions ------------------------------------------ */

/**
 * Personal ORDER_PLACED row. Pass the order transaction's client so the order
 * and its notification are saved together (or not at all).
 */
export async function notifyOrderPlaced(orderId: string, client: Client = db()) {
  const order = await client.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, orderNumber: true, items: { select: { quantity: true } } },
  });
  if (!order) throw new Error("Order not found for notification.");
  const count = order.items.reduce((n, i) => n + i.quantity, 0);
  return create(client, {
    type: "ORDER_PLACED",
    title: `Order ${order.orderNumber} placed`,
    body: `${count} ${count === 1 ? "item" : "items"}. We'll let you know when it ships.`,
    link: orderLink(order.id),
    userId: order.userId,
    orderId: order.id,
  });
}

const STATUS_TEXT: Record<Exclude<OrderStatus, "placed">, string> = {
  confirmed: "is confirmed",
  shipped: "has shipped",
  delivered: "was delivered",
  cancelled: "was cancelled",
};

/**
 * Personal ORDER_STATUS row. Call it wherever an order's status changes.
 * Nothing changes order status in the app yet (no admin screen); this is ready for it.
 */
export async function notifyOrderStatusChanged(
  orderId: string,
  newStatus: Exclude<OrderStatus, "placed">,
  client: Client = db(),
) {
  const order = await client.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, orderNumber: true },
  });
  if (!order) throw new Error("Order not found for notification.");
  return create(client, {
    type: "ORDER_STATUS",
    title: `Order ${order.orderNumber} ${STATUS_TEXT[newStatus]}`,
    link: orderLink(order.id),
    userId: order.userId,
    orderId: order.id,
  });
}

/** Personal REVIEW_PUBLISHED row for the review's author. Skips sample and hidden reviews. */
export async function notifyReviewPublished(reviewId: string, client: Client = db()) {
  const review = await client.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, status: true, product: { select: { id: true, name: true } } },
  });
  if (!review || !review.userId || review.status !== "published") return null;
  return create(client, {
    type: "REVIEW_PUBLISHED",
    title: `Your review for ${review.product.name} is live`,
    link: productPageHref(review.product.id),
    userId: review.userId,
    productId: review.product.id,
  });
}

/**
 * One broadcast NEW_PRODUCT row (name and link only, no price or stock).
 * For the admin product upload (not built yet); nothing calls it automatically.
 */
export async function notifyNewProduct(productId: string, client: Client = db()) {
  const product = await client.product.findFirst({
    where: { id: productId, isActive: true },
    select: { id: true, name: true },
  });
  if (!product) throw new Error("Active product not found for notification.");
  return create(client, {
    type: "NEW_PRODUCT",
    title: `New in store: ${product.name}`,
    link: productPageHref(product.id),
    userId: null,
    productId: product.id,
  });
}

/**
 * Removes the ORDER_PLACED row of an order that never went through
 * (live Razorpay order cancelled because Razorpay failed; plan decision D2).
 */
export async function removeOrderPlacedNotification(orderId: string, client: Client = db()) {
  await client.notification.deleteMany({ where: { orderId, type: "ORDER_PLACED" } });
}

/* Reads (scoped to the user) ----------------------------------------- */

/** This user's rows, plus broadcasts created since they signed up. */
async function visibleTo(userId: string): Promise<Prisma.NotificationWhereInput | null> {
  const user = await db().user.findUnique({ where: { id: userId }, select: { createdAt: true } });
  if (!user) return null;
  return { OR: [{ userId }, { userId: null, createdAt: { gte: user.createdAt } }] };
}

/** The 10 newest visible notifications and the total unread count. */
export async function getNotificationsForUser(
  userId: string,
): Promise<{ items: NotificationItem[]; unreadCount: number }> {
  const visible = await visibleTo(userId);
  if (!visible) return { items: [], unreadCount: 0 };

  const [rows, unreadCount] = await Promise.all([
    db().notification.findMany({
      where: visible,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: NOTIFICATION_LIMIT,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        link: true,
        createdAt: true,
        reads: { where: { userId }, select: { id: true } },
      },
    }),
    db().notification.count({ where: { AND: [visible, { reads: { none: { userId } } }] } }),
  ]);

  return {
    items: rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      body: r.body,
      link: r.link,
      createdAt: r.createdAt.toISOString(),
      isRead: r.reads.length > 0,
    })),
    unreadCount,
  };
}

/** Unread count only (root layout, for the badge). */
export async function getUnreadCount(userId: string): Promise<number> {
  const visible = await visibleTo(userId);
  if (!visible) return 0;
  return db().notification.count({ where: { AND: [visible, { reads: { none: { userId } } }] } });
}

/**
 * Marks notifications read for this user. Only rows the user can see are marked;
 * ids of other users' notifications are ignored. Existing read rows are skipped.
 */
export async function markNotificationsRead(
  userId: string,
  selection: { ids: string[] } | { all: true },
): Promise<number> {
  const visible = await visibleTo(userId);
  if (!visible) return 0;
  const targets = await db().notification.findMany({
    where: {
      AND: [
        visible,
        { reads: { none: { userId } } },
        "ids" in selection ? { id: { in: selection.ids } } : {},
      ],
    },
    select: { id: true },
  });
  if (targets.length === 0) return 0;
  const created = await db().notificationRead.createMany({
    data: targets.map((t) => ({ notificationId: t.id, userId })),
    skipDuplicates: true,
  });
  return created.count;
}
