# Spec: Certifications section

## Layout (from the reference screenshot)
- Two columns on desktop: text block on the left, certificate cards on the right.
- Left column: a small eyebrow line ("Check Out"), a large heading ("Certifications"),
  a short paragraph, and a "View all" button.
- Right column: a grid of certificate cards, 3 per row on desktop.
- Each card: certificate image with a thin border and soft shadow, then the title
  (bold) and the issuer (smaller, in the accent color) below it.
- Mobile (390px): text block stacks above the cards. Cards show 2 per row.

## Visual
- Follow DESIGN.md and the current site for colors, radius, spacing and typography.
- Do not use the dark background, green script font or other colors from the reference.
- Heading style matches "Best Sellers".
- Keep the page background the same as the rest of the page. Do not add new colors.
- Reference for layout only: docs/design/reference/certificate-layout-reference.png

## Content
- Text block copy comes from lib/site-content.ts so the client can edit it later.
  Placeholder: "Our certifications and authorisations, shared so you can verify our credentials."
- Certificate data lives in lib/certificates.ts. Each item has: id, title, issuer,
  image path in public/images/certificates, alt text, and showOnSite (boolean).
- Only the client's own certificates are added. Never add certificates from another
  company or person.
- Items with showOnSite: false are never rendered.
- Show the first 6 certificates. If there are more, the "View all" button opens
  /certificates (the page can be a placeholder until built).
- Clicking a card opens the larger view. Close it with the close button or Esc.
  Focus returns to the card that opened it.
- If no certificates are set to show, hide the whole section.
- Every image uses next/image with width and height and descriptive alt text.

## Done when
- [ ] Two-column layout on desktop (1440px), matching the reference arrangement
- [ ] Cards show image, title and issuer, with consistent alignment
- [ ] Colors and fonts come from tokens, matching the current site (no new colors)
- [ ] Mobile (390px): text stacks above, 2 cards per row, no sideways page scroll
- [ ] Only showOnSite: true items appear
- [ ] Overlay opens, closes with Esc and close button, and returns focus to the card
- [ ] Section hidden when no items are shown
- [ ] No hardcoded hex colors, no console errors
- [ ] npm run lint and npm run check-types pass