# 004 — Certificate Section

## Objective
Create a Certificate section directly below the Product section on the homepage, displaying certificates stored in the project's public certificate folder.

## 1. Design References
- Desktop: `HomePageLaptop.png`
- Mobile: `homepagemobile.png`
- Read `CLAUDE.md` and `DESIGN.md` before implementation.
- Follow the existing homepage design language and spacing.

## 2. Certificate Data
Create:

`apps/web/lib/certificate.ts`

- Export a static array of certificates.
- Use the actual certificate images available in `apps/web/public/images/certificate/` (or the existing certificate folder if its path differs).
- Each certificate should contain:
  - `id`
  - `name`
  - `image`

Example:

```typescript
export const certificates = [
  {
    id: "cert-001",
    name: "Certificate Name",
    image: "/images/certificate/certificate-1.png",
  },
];
```

Do not invent certificate images or paths.

## 3. Certificate Layout
- Place the Certificate section immediately below the Product section.
- Display certificates in a **2-column grid with 2 rows** (four certificates).
- Use the same visual style across desktop and mobile, adapting spacing to the viewport.
- Add a black border/frame around each certificate image to give it an authentic, premium certificate appearance.
- Keep certificate images properly contained without stretching or cropping important content.
- Maintain consistent card dimensions, spacing, and alignment.

## 4. Design & Styling
- Use a clean, elegant, professional appearance.
- Black certificate borders should be visually prominent but not overpowering.
- Follow existing typography, spacing, and radius conventions.
- Use centralized theme tokens from `apps/web/app/globals.css`.
- Do not hardcode HEX, RGB, or other color values in components.
- Use `next/image` for certificate images.

## 5. Technical Rules
- Reuse existing components wherever possible.
- Keep certificate data separate from UI components.
- No database or API integration.
- Do not introduce unnecessary dependencies.
- Ensure responsive behavior at 390px and 1440px.

## 6. Acceptance Criteria
- [ ] Certificate section appears below Product section.
- [ ] All available certificate images are used appropriately.
- [ ] `lib/certificate.ts` contains static certificate data.
- [ ] Desktop and mobile references are followed.
- [ ] Layout uses 2 columns and 2 rows for four certificates.
- [ ] Each certificate has a black outer frame/border.
- [ ] Images maintain their original aspect ratio.
- [ ] No image stretching or unwanted cropping.
- [ ] Responsive at 390px and 1440px.
- [ ] Run `npm run lint && npm run check-types` before completion.