import type { ReactNode } from "react";
import { requireUser } from "../../lib/auth/session";

/** /orders and /orders/* need a logged-in user (spec 013). /orders/[id] checks its own path too. */
export default async function OrdersLayout({ children }: { children: ReactNode }) {
  await requireUser("/orders");
  return children;
}
