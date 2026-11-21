import type { Metadata } from "next";
import InfoPage from "../../../components/info-page";
import { BULK } from "../../../lib/info-pages";

export const metadata: Metadata = { title: BULK.title };

export default function Page() {
  return <InfoPage content={BULK} />;
}
