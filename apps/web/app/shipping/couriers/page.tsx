import type { Metadata } from "next";
import InfoPage from "../../../components/info-page";
import { COURIERS } from "../../../lib/info-pages";

export const metadata: Metadata = { title: COURIERS.title };

export default function Page() {
  return <InfoPage content={COURIERS} />;
}
