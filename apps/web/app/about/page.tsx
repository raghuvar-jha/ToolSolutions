import type { Metadata } from "next";
import InfoPage from "../../components/info-page";
import { ABOUT } from "../../lib/info-pages";

export const metadata: Metadata = { title: ABOUT.title };

export default function Page() {
  return <InfoPage content={ABOUT} />;
}
