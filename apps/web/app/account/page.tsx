import type { Metadata } from "next";
import SiteHeader from "../../components/Header";
import Footer from "../../components/footer";
import { requireUser } from "../../lib/auth/session";

export const metadata: Metadata = { title: "My account" };

// Same classes as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

/** Account (spec 013): name and email, read-only for now. Logged out: /login?next=/account. */
export default async function AccountPage() {
  const user = await requireUser("/account");

  return (
    <>
      <SiteHeader />
      <main className={`${CONTAINER} py-6 lg:py-10`}>
        <h1 className="text-2xl font-semibold text-text lg:text-[32px] lg:leading-tight">My account</h1>
        <section
          aria-labelledby="account-details"
          className="mt-6 max-w-xl rounded-card border border-line bg-surface p-4 shadow-sm lg:p-6"
        >
          <h2 id="account-details" className="text-lg font-semibold text-text">
            Account details
          </h2>
          <dl className="mt-4 divide-y divide-line text-[15px]">
            <div className="grid gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-4">
              <dt className="text-muted">Name</dt>
              <dd className="font-semibold text-text break-words">{user.name}</dd>
            </div>
            <div className="grid gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-4">
              <dt className="text-muted">Email</dt>
              <dd className="font-semibold text-text break-all">{user.email}</dd>
            </div>
          </dl>
        </section>
      </main>
      <Footer />
    </>
  );
}
