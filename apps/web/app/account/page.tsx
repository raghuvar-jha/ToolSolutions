import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Heart, MapPin, Package, type LucideIcon } from "lucide-react";
import NameForm from "../../components/account/name-form";
import SiteHeader from "../../components/Header";
import Footer from "../../components/footer";
import { requireUser } from "../../lib/auth/session";

export const metadata: Metadata = { title: "My account" };

// Same classes as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

const LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/orders", label: "My orders", icon: Package },
  { href: "/account/addresses", label: "Saved addresses", icon: MapPin },
  { href: "/saved", label: "Saved items", icon: Heart },
];

/** Account (specs 013 and 014): editable name, email (read-only), links. Logged out: /login?next=/account. */
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
              <dd>
                <NameForm name={user.name} />
              </dd>
            </div>
            <div className="grid gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-4">
              <dt className="text-muted">Email</dt>
              <dd className="font-semibold text-text break-all">{user.email}</dd>
            </div>
          </dl>
        </section>

        <nav aria-label="Account" className="mt-6 max-w-xl">
          <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-sm">
            {LINKS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-4 py-4 text-[15px] text-text hover:bg-well lg:px-6 ${FOCUS}`}
                >
                  <Icon aria-hidden className="size-5 text-brand-700" />
                  <span className="flex-1">{label}</span>
                  <ChevronRight aria-hidden className="size-4 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      <Footer />
    </>
  );
}
