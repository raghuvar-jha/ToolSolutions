import type { ReactNode } from "react";
import { requireUser } from "../../lib/auth/session";

/** /saved needs a logged-in user (spec 013). The page itself is a client component. */
export default async function SavedLayout({ children }: { children: ReactNode }) {
  await requireUser("/saved");
  return children;
}
