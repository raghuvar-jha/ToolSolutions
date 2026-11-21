/** Footer link columns (DESIGN.md §5 Footer). Also listed on /sitemap. */
export type FooterLink = { label: string; href: string };
export type LinkGroup = { title: string; links: FooterLink[] };

export const LINK_GROUPS: LinkGroup[] = [
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Reviews", href: "/reviews" },
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Cookie policy", href: "/cookie-policy" },
      { label: "Terms & conditions", href: "/terms" },
      { label: "Acceptable use policy", href: "/acceptable-use" },
      { label: "Sitemap", href: "/sitemap" },
    ],
  },
  {
    title: "Shipping services",
    links: [
      { label: "Ship a package", href: "/shipping/ship-a-package" },
      { label: "Track a package", href: "/orders" },
      { label: "Domestic shipping", href: "/shipping/domestic" },
      { label: "International shipping", href: "/shipping/international" },
      { label: "Bulk shipping", href: "/shipping/bulk" },
      { label: "Couriers", href: "/shipping/couriers" },
      { label: "Delivery services", href: "/shipping/delivery" },
    ],
  },
  {
    title: "Customers",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Register", href: "/signup" },
      { label: "Contact us", href: "/contact" },
      { label: "Support hub", href: "/support" },
      { label: "Preferences", href: "/account" },
    ],
  },
];
