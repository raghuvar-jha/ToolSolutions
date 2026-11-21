import type { Metadata } from "next";
import InfoPage from "../../components/info-page";
import LinkList from "../../components/link-list";
import { SUPPORT } from "../../lib/info-pages";

export const metadata: Metadata = { title: SUPPORT.title };

const ITEMS = [
  { label: "My orders", href: "/orders" },
  { label: "Domestic shipping", href: "/shipping/domestic" },
  { label: "Bulk orders", href: "/shipping/bulk" },
  { label: "My account", href: "/account" },
  { label: "Contact us", href: "/contact" },
];

export default function SupportPage() {
  return (
    <InfoPage content={SUPPORT}>
      <LinkList label="Support links" items={ITEMS} />
    </InfoPage>
  );
}
