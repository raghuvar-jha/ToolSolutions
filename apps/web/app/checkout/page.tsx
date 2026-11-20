import type { Metadata } from "next";
import { connection } from "next/server";
import SiteHeader from "../../components/Header";
import Footer from "../../components/footer";
import CheckoutForm from "../../components/checkout/checkout-form";
import Stepper from "../../components/checkout/stepper";
import { getPublicPaymentConfig } from "../../lib/payments";

// Same classes as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

export const metadata: Metadata = { title: "Checkout" };

/**
 * Checkout (spec 009). Server component: reads the payment settings from the
 * environment at request time and passes only browser-safe values down.
 */
export default async function CheckoutPage() {
  await connection(); // read env per request, not at build time
  const { mode, codMax, razorpayAvailable } = getPublicPaymentConfig();

  return (
    <>
      <SiteHeader />
      <main className={`${CONTAINER} py-6 lg:py-10`}>
        <h1 className="sr-only">Checkout</h1>
        <Stepper current="Address" />
        <CheckoutForm config={{ mode, codMax, razorpayAvailable }} />
      </main>
      <Footer />
      {/* Mobile: room for the sticky pay bar so it never covers the footer. */}
      <div aria-hidden className="h-20 lg:hidden" />
    </>
  );
}
