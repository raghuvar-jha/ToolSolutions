import type { Metadata } from "next";
import InfoPage from "../../../components/info-page";
import { DELIVERY } from "../../../lib/info-pages";

export const metadata: Metadata = { title: DELIVERY.title };

export default function Page() {
  return <InfoPage content={DELIVERY} />;
}
