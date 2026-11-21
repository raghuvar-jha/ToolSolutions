import Link from "next/link";
import { ChevronRight } from "lucide-react";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

export type LinkListItem = { label: string; href: string; external?: boolean };

/** Bordered list of full-row links with a chevron (account-page style). */
export default function LinkList({ items, label }: { items: LinkListItem[]; label: string }) {
  return (
    <ul
      aria-label={label}
      className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-sm"
    >
      {items.map(({ label: text, href, external }) => {
        const className = `flex items-center justify-between gap-3 px-4 py-4 text-[15px] text-text hover:bg-well lg:px-6 ${FOCUS}`;
        const content = (
          <>
            {text}
            <ChevronRight aria-hidden className="size-5 shrink-0 text-muted" />
          </>
        );
        return (
          <li key={href}>
            {external ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
                {content}
              </a>
            ) : (
              <Link href={href} className={className}>
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
