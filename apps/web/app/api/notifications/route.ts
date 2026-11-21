/**
 * GET /api/notifications (spec 016): the 10 newest notifications visible to the
 * logged-in user (their own plus broadcasts), with each item's read state and
 * the total unread count. Logged out: 401 (the bell shows its login prompt).
 */
import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth/session";
import { getNotificationsForUser } from "../../../lib/notifications/notification-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to see your notifications." }, { status: 401 });

  try {
    const { items, unreadCount } = await getNotificationsForUser(user.id);
    return NextResponse.json(
      { notifications: items, unreadCount },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("notifications failed", (error as { code?: string })?.code ?? (error as Error)?.name);
    return NextResponse.json({ error: "Could not load notifications." }, { status: 500 });
  }
}
