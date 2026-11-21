import type { Metadata } from "next";
import InfoPage from "../../components/info-page";
import LinkList from "../../components/link-list";
import { CONTACT } from "../../lib/info-pages";
import { contactPhone, contactPhoneLabel, whatsappMessage, whatsappNumber } from "../../lib/site-config";

export const metadata: Metadata = { title: CONTACT.title };

const ITEMS = [
  { label: `Call us: ${contactPhoneLabel}`, href: `tel:${contactPhone}`, external: true },
  ...(whatsappNumber
    ? [
        {
          label: "Chat on WhatsApp",
          href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
          external: true,
        },
      ]
    : []),
  { label: "Support hub", href: "/support" },
];

export default function ContactPage() {
  return (
    <InfoPage content={CONTACT}>
      <LinkList label="Ways to contact us" items={ITEMS} />
    </InfoPage>
  );
}
