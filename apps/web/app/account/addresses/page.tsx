import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../../components/Header";
import Footer from "../../../components/footer";
import AddressBook from "../../../components/account/address-book";
import { getAddresses } from "../../../lib/account/address-service";
import { requireUser } from "../../../lib/auth/session";

export const metadata: Metadata = { title: "Saved addresses" };

// Same classes as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

/** The logged-in user's addresses (spec 014). Checkout pre-selects the default one. */
export default async function AddressesPage() {
  const user = await requireUser("/account/addresses");
  const addresses = await getAddresses(user.id);

  return (
    <>
      <SiteHeader />
      <main className={`${CONTAINER} py-6 lg:py-10`}>
        <Link href="/account" className={`rounded-sm text-sm text-brand-700 underline-offset-2 hover:underline ${FOCUS}`}>
          ← My account
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-text lg:text-[32px] lg:leading-tight">Saved addresses</h1>
        <p className="mt-1 text-[15px] text-muted">Your default address is selected at checkout.</p>
        <div className="mt-6">
          <AddressBook addresses={addresses} />
        </div>
      </main>
      <Footer />
    </>
  );
}
