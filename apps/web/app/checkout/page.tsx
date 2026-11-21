import type { Metadata } from "next";
import { connection } from "next/server";
import SiteHeader from "../../components/Header";
import Footer from "../../components/footer";
import CheckoutForm from "../../components/checkout/checkout-form";
import Stepper from "../../components/checkout/stepper";
import { getAddresses } from "../../lib/account/address-service";
import { requireUser } from "../../lib/auth/session";
import { getPublicPaymentConfig } from "../../lib/payments";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** "/checkout" plus the Buy Now query (?product=…&qty=…), so login returns to the same checkout. */
async function checkoutPath(searchParams: PageProps["searchParams"]) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const v of Array.isArray(value) ? value : value === undefined ? [] : [value]) query.append(key, v);
  }
  const qs = query.toString();
  return qs ? `/checkout?${qs}` : "/checkout";
}

// Same classes as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

export const metadata: Metadata = { title: "Checkout" };

/**
 * Checkout (spec 009). Server component: reads the payment settings from the
 * environment at request time and passes only browser-safe values down.
 */
export default async function CheckoutPage({ searchParams }: PageProps) {
  await connection(); // read env per request, not at build time
  const user = await requireUser(await checkoutPath(searchParams)); // spec 013: login required
  // Spec 014: the user's saved addresses (default first) and email for the address form.
  const addresses = (await getAddresses(user.id)).map(({ id, isDefault, ...a }) => ({ ...a, id, isDefault }));
  const { mode, codMax, razorpayAvailable } = getPublicPaymentConfig();

  return (
    <>
      <SiteHeader />
      <main className={`${CONTAINER} py-6 lg:py-10`}>
        <h1 className="sr-only">Checkout</h1>
        <Stepper current="Address" />
        <CheckoutForm config={{ mode, codMax, razorpayAvailable }} addresses={addresses} email={user.email} />
      </main>
      <Footer />
      {/* Mobile: room for the sticky pay bar so it never covers the footer. */}
      <div aria-hidden className="h-20 lg:hidden" />
    </>
  );
}
