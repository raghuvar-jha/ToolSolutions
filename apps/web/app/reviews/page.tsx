import type { Metadata } from "next";
import InfoPage from "../../components/info-page";
import { REVIEWS } from "../../lib/info-pages";

export const metadata: Metadata = { title: REVIEWS.title };

export default function Page() {
  return <InfoPage content={REVIEWS} />;
}
