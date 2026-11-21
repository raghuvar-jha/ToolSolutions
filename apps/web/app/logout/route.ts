/**
 * POST /logout (spec 013): deletes the session row, clears the cookie, goes home.
 * Requests from another site are rejected (the cookie is SameSite=Lax as well).
 */
import { NextResponse, type NextRequest } from "next/server";
import { deleteCurrentSession } from "../../lib/auth/session";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin !== null && origin !== request.nextUrl.origin) {
    return new NextResponse(null, { status: 403 });
  }
  await deleteCurrentSession();
  // 303: the browser follows with a GET to the home page.
  return NextResponse.redirect(new URL("/", request.nextUrl), 303);
}
