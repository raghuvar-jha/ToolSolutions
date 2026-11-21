"use client";

import { usePathname } from "next/navigation";
import WhatsAppButton from "./whatsapp-button";

/** Product detail pages: /products/<id> (not the /products listing). */
const isProductPage = (path: string) => /^\/products\/[^/]+$/.test(path);

/**
 * The site-wide WhatsApp button in the root layout (spec 015).
 * - /checkout: hidden, the Pay bar uses the same corner on mobile.
 * - Product pages: rendered by the page itself, with the product in the message.
 * - /cart: raised above the cart's sticky total bar on mobile.
 */
export default function WhatsAppButtonSlot() {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/checkout") || isProductPage(pathname)) return null;
  return <WhatsAppButton aboveStickyBar={pathname === "/cart"} />;
}
