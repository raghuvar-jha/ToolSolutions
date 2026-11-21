import type { Metadata } from "next";
import InfoPage from "../../components/info-page";
import { TERMS } from "../../lib/info-pages";

export const metadata: Metadata = { title: TERMS.title };

export default function Page() {
  return <InfoPage content={TERMS} />;
}
