import type { Metadata } from "next";
import InfoPage from "../../components/info-page";
import { PRIVACY } from "../../lib/info-pages";

export const metadata: Metadata = { title: PRIVACY.title };

export default function Page() {
  return <InfoPage content={PRIVACY} />;
}
