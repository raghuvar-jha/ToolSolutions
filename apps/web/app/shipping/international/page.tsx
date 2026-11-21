import type { Metadata } from "next";
import InfoPage from "../../../components/info-page";
import { INTERNATIONAL } from "../../../lib/info-pages";

export const metadata: Metadata = { title: INTERNATIONAL.title };

export default function Page() {
  return <InfoPage content={INTERNATIONAL} />;
}
