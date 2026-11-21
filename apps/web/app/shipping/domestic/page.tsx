import type { Metadata } from "next";
import InfoPage from "../../../components/info-page";
import { DOMESTIC } from "../../../lib/info-pages";

export const metadata: Metadata = { title: DOMESTIC.title };

export default function Page() {
  return <InfoPage content={DOMESTIC} />;
}
