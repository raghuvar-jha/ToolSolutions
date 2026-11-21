import type { Metadata } from "next";
import InfoPage from "../../components/info-page";
import { COOKIES } from "../../lib/info-pages";

export const metadata: Metadata = { title: COOKIES.title };

export default function Page() {
  return <InfoPage content={COOKIES} />;
}
