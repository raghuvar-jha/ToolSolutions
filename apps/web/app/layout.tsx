import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import MobileTabBar from "../components/mobile-tab-bar";
import WhatsAppButtonSlot from "../components/whatsapp-button-slot";
import { CartProvider } from "../lib/cart/cart-context";
import { CatalogProvider } from "../lib/catalog/catalog-context";
import { getAllProducts } from "../lib/catalog/product-repository";
import { getCurrentUser } from "../lib/auth/session";
import { UserProvider } from "../lib/auth/user-context";
import { getUnreadCount } from "../lib/notifications/notification-service";
import { getSavedProductIds } from "../lib/saved/saved-service";
import { SavedProvider } from "../lib/saved/saved-context";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const SITE_TITLE = "Tools Solutions - India's No. 1 Tools Provider";
const SITE_DESCRIPTION =
  "Buy genuine power tools, hand tools and industrial supplies online at Tools Solutions, India's No. 1 tools provider. Best prices and fast delivery across India.";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    // Pages that set their own title (e.g. "Checkout") render as "Checkout | Tools Solutions".
    template: "%s | Tools Solutions",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Tools Solutions",
  keywords: [
    "Tools Solutions",
    "tools provider in India",
    "best tools shop in India",
    "buy tools online India",
    "online tool store",
    "power tools",
    "hand tools",
    "industrial tools",
    "electric tools",
    "cordless drill",
    "angle grinder",
    "impact driver",
    "tool kit",
    "garden tools",
    "measuring tools",
    "cutting tools",
    "welding tools",
    "safety equipment",
    "hardware tools",
    "tools at best price",
    "genuine tools",
    "wholesale tools India",
  ],
  category: "shopping",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Tools Solutions",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

// viewport-fit=cover lets the mobile tab bar pad for the iPhone home indicator
// (env(safe-area-inset-bottom)). No effect on desktop.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Cart, saved items and recommendations look products up in this catalog.
  // The header shows the first name and unread notification count only; nothing else
  // about the user reaches the browser here.
  const [catalog, user] = await Promise.all([getAllProducts(), getCurrentUser()]);
  // Saved product ids for the hearts and the header count, and the bell's unread count (only this user's).
  const [savedIds, unreadNotifications] = user
    ? await Promise.all([getSavedProductIds(user.id), getUnreadCount(user.id)])
    : [[], 0];
  const sessionUser = user
    ? { firstName: user.name.trim().split(/\s+/)[0] ?? user.name, unreadNotifications }
    : null;

  return (
    <html lang="en" className={poppins.variable}>
      {/* Mobile: bottom padding so the fixed tab bar never covers content. */}
      <body className="pb-[calc(59px+env(safe-area-inset-bottom))] lg:pb-0">
        {/* Shared cart and saved-items state for the header, cards, product page and cart page. */}
        <UserProvider user={sessionUser}>
          <CatalogProvider products={catalog}>
            <CartProvider>
              <SavedProvider initialIds={savedIds} loggedIn={user !== null}>
                {children}
                <WhatsAppButtonSlot />
                <MobileTabBar />
              </SavedProvider>
            </CartProvider>
          </CatalogProvider>
        </UserProvider>
      </body>
    </html>
  );
}
