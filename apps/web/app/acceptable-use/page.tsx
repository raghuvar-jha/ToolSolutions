import type { Metadata } from "next";
import InfoPage from "../../components/info-page";
import { ACCEPTABLE_USE } from "../../lib/info-pages";

export const metadata: Metadata = { title: ACCEPTABLE_USE.title };

export default function Page() {
  return <InfoPage content={ACCEPTABLE_USE} />;
}
