import Image from "next/image";
import type { ReactNode } from "react";

// Same classes as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

type AuthLayoutProps = {
  /** Panel heading, e.g. "Sign up". */
  title: string;
  /** Short line under the heading (desktop only). */
  intro: string;
  children: ReactNode;
};

/**
 * Auth card (spec 010): primary-colour panel (40%) + white form panel (60%)
 * on desktop; on mobile the panel shrinks to a short banner with the heading.
 */
export default function AuthLayout({ title, intro, children }: AuthLayoutProps) {
  return (
    <div className="bg-well py-6 md:py-12">
      <div className={CONTAINER}>
        <div className="mx-auto max-w-[720px] overflow-hidden rounded-card border border-line bg-surface shadow-sm md:grid md:grid-cols-[2fr_3fr]">
          <div className="flex min-h-[120px] flex-col justify-center bg-brand-950 px-6 py-6 md:justify-start md:px-8 md:py-10">
            <h1 className="text-[28px] leading-tight font-semibold text-surface md:text-[32px]">{title}</h1>
            <p className="mt-4 hidden text-base leading-relaxed text-brand-100 md:block">{intro}</p>
            <Image
              src="/images/auth/signup-illustration.svg"
              alt="Tools illustration"
              width={320}
              height={220}
              className="mt-auto hidden h-auto w-full pt-10 md:block"
            />
          </div>
          <div className="px-4 py-6 sm:px-8 md:px-10 md:py-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
