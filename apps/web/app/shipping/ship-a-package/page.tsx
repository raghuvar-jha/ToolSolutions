import type { Metadata } from "next";
import InfoPage from "../../../components/info-page";
import { SHIP_A_PACKAGE } from "../../../lib/info-pages";

export const metadata: Metadata = { title: SHIP_A_PACKAGE.title };

export default function Page() {
  return <InfoPage content={SHIP_A_PACKAGE} />;
}
