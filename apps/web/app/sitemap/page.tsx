import type { Metadata } from "next";
import InfoPage from "../../components/info-page";
import LinkList from "../../components/link-list";
import { CATEGORIES, categoryHref } from "../../lib/categories";
import { LINK_GROUPS } from "../../lib/footer-links";
import { SITEMAP } from "../../lib/info-pages";

export const metadata: Metadata = { title: SITEMAP.title };

const GROUPS = [
  {
    title: "Shop",
    links: [
      { label: "Home", href: "/" },
      { label: "All products", href: "/products" },
      ...CATEGORIES.map((c) => ({ label: c.name, href: categoryHref(c.slug) })),
      { label: "Cart", href: "/cart" },
      { label: "Saved items", href: "/saved" },
    ],
  },
  ...LINK_GROUPS,
];

export default function SitemapPage() {
  return (
    <InfoPage content={SITEMAP}>
      <div className="space-y-8">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="mb-3 text-lg font-semibold text-text lg:text-xl">{group.title}</h2>
            <LinkList label={group.title} items={group.links} />
          </section>
        ))}
      </div>
    </InfoPage>
  );
}
