import type { ReactNode } from "react";
import SiteHeader from "./Header";
import Footer from "./footer";
import type { InfoPageContent } from "../lib/info-pages";

// Same classes as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

type InfoPageProps = {
  content: InfoPageContent;
  /** Extra content below the text sections (contact rows, link lists). */
  children?: ReactNode;
};

/** Plain text page for the footer links: header, title, intro, sections, footer. */
export default function InfoPage({ content, children }: InfoPageProps) {
  return (
    <>
      <SiteHeader />
      <main className={`${CONTAINER} py-6 lg:py-10`}>
        <article className="max-w-3xl">
          <h1 className="text-2xl font-semibold text-text lg:text-[32px] lg:leading-tight">
            {content.title}
          </h1>
          {content.intro && <p className="mt-3 text-base leading-relaxed text-body">{content.intro}</p>}

          {content.sections.map((section) => (
            <section key={section.heading} className="mt-8">
              <h2 className="text-lg font-semibold text-text lg:text-xl">{section.heading}</h2>
              {section.paragraphs.map((text) => (
                <p key={text} className="mt-2 text-[15px] leading-relaxed text-body">
                  {text}
                </p>
              ))}
            </section>
          ))}

          {children && <div className="mt-8">{children}</div>}
        </article>
      </main>
      <Footer />
    </>
  );
}
