import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SiteHeader from "../../components/Header";
import Footer from "../../components/footer";
import AuthLayout from "../../components/auth/auth-layout";
import SignupForm from "../../components/auth/signup-form";
import { getCurrentUser } from "../../lib/auth/session";

export const metadata: Metadata = { title: "Sign up" };

/** Signup (specs 010 and 013). Already logged in: go to the account page. */
export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/account");
  return (
    <>
      <SiteHeader />
      <main>
        <AuthLayout
          title="Sign up"
          intro="Create an account to track orders, save addresses and check out faster"
        >
          <SignupForm />
        </AuthLayout>
      </main>
      <Footer />
    </>
  );
}
