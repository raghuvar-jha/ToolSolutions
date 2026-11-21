import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SiteHeader from "../../components/Header";
import Footer from "../../components/footer";
import AuthLayout from "../../components/auth/auth-layout";
import LoginForm from "../../components/auth/login-form";
import { safeNext } from "../../lib/auth/safe-next";
import { getCurrentUser } from "../../lib/auth/session";

export const metadata: Metadata = { title: "Log in" };

type PageProps = { searchParams: Promise<{ next?: string | string[] }> };

/** Login (spec 013, same layout as /signup). ?next= is where to go after logging in. */
export default async function LoginPage({ searchParams }: PageProps) {
  const { next: raw } = await searchParams;
  const next = safeNext(Array.isArray(raw) ? raw[0] : raw);
  if (await getCurrentUser()) redirect(next);
  return (
    <>
      <SiteHeader />
      <main>
        <AuthLayout
          title="Login"
          intro="Log in to track orders, save addresses and check out faster"
        >
          <LoginForm next={next} />
        </AuthLayout>
      </main>
      <Footer />
    </>
  );
}
