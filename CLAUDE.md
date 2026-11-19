# Project: Tools Store (web first, mobile later)

## Stack
Next.js (App Router), TypeScript, Tailwind CSS v4, Turborepo (npm), Lucide Icons.
Database later: PostgreSQL + Prisma.

## Design rules
- Read DESIGN.md before creating or changing any UI.
- Colors, radius and widths come from the @theme tokens in apps/web/app/globals.css.
  Never hardcode hex colors in components.
- Reference screenshots are in docs/design/reference. They are for layout reference only.
- Site images live in apps/web/public/images and are used with next/image.
- Build mobile-first and check 390px and 1440px widths.
- Do not copy third-party logos, icons or brand assets.

## Code rules
- Components go in apps/web/components. Reuse before creating new ones.
- Keep components small, one per file.
- API routes go under apps/web/app/api/v1/.
- Never read, print or commit .env files.

## Workflow
- Work on a feature branch, never on main.
- Before saying a task is done, run: npm run lint && npm run check-types
- Commit messages: feat:, fix:, chore: