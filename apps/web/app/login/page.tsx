import type { Metadata } from "next";
import SiteHeader from "../../components/Header";
import Footer from "../../components/footer";
import AuthLayout from "../../components/auth/auth-layout";
import LoginForm from "../../components/auth/login-form";

export const metadata: Metadata = { title: "Log in" };

/** Login (demo, same layout as /signup): checks the account in this browser; no session yet. */
export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AuthLayout
          title="Login"
          intro="Log in to track orders, save addresses and check out faster"
        >
          <LoginForm />
        </AuthLayout>
      </main>
      <Footer />
    </>
  );
}
