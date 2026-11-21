/**
 * POST /api/notifications/read (spec 016). Body: { ids: string[] } or { all: true }.
 * Marks only notifications this user can see; existing read rows are skipped.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "../../../../lib/auth/session";
import { markNotificationsRead } from "../../../../lib/notifications/notification-service";

const bodySchema = z.union([
  z.object({ ids: z.array(z.string().min(1).max(64)).min(1).max(50) }).strict(),
  z.object({ all: z.literal(true) }).strict(),
]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  try {
    const marked = await markNotificationsRead(user.id, parsed.data);
    return NextResponse.json({ marked });
  } catch (error) {
    console.error("mark read failed", (error as { code?: string })?.code ?? (error as Error)?.name);
    return NextResponse.json({ error: "Could not update notifications." }, { status: 500 });
  }
}
