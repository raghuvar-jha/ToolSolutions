import type { Metadata } from "next";
import SiteHeader from "../../components/Header";
import Footer from "../../components/footer";
import AuthLayout from "../../components/auth/auth-layout";
import SignupForm from "../../components/auth/signup-form";

export const metadata: Metadata = { title: "Sign up" };

/** Signup (spec 010, demo): accounts are saved in this browser only, without passwords. */
export default function SignupPage() {
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
