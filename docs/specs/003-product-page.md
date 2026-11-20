# Spec: Best Sellers product grid and product card

## Visual
Follow DESIGN.md section "Product card" and the reference
docs/design/reference/productsPage.png (desktop only).
Mobile layout is not in the reference: derive it from DESIGN.md mobile rules and report what you assumed.

## Behavior
- Section heading "Best Sellers" above the grid
- Filter chips in a row: "All Products" plus one chip per category.
  Clicking a chip shows only that category. The selected chip uses the active style.
  On mobile the chip row scrolls horizontally.
- Grid: 3 columns on desktop, 2 columns on mobile (390px)
- Each card shows:
  - Product image (fixed square ratio, object-contain, light background)
  - "Sale" badge in the top-left corner, only when the product is on sale
  - Product name
  - Current price in ₹, with the original price struck through when on sale
  - "View Product" button linking to /products/[id]
  -Products Going to import from lib/Products.ts
- Hover (desktop): card lifts with a soft shadow and the button turns the primary color
- Mobile: the button is always visible, no hover state needed
- Products come from apps/web/lib/products.ts (placeholder data for now)
- If a chip has no products, show "No products in this category yet"

## Done when
- [ ] Matches productsPage.png at 1440px (layout, spacing, badge, price, button)
- [ ] Mobile at 390px shows 2 columns with no horizontal page scroll
- [ ] Chips filter the grid and the selected state is visible
- [ ] Hover state works on desktop
- [ ] No hardcoded hex colors
- [ ] No console errors
- [ ] npm run lint and npm run check-types pass