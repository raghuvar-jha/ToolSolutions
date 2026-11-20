# Spec: Product detail page

Route: /products/[slug]

## Layout (from docs/design/reference/product-page-layout-reference.png)
Desktop (1440px), two columns inside the shared container:
- Left column: large main image (square-ish, rounded corners, light background),
  with 3 thumbnails in a row below it. Clicking a thumbnail changes the main image.
- Right column, top to bottom:
  1. Product name (heading style from DESIGN.md)
  2. Price in ₹. Original price struck through only when a real original price exists.
     Show the savings amount only when it is calculated from real prices.
  3. "Description" accordion box (rounded border, chevron toggle, open by default).
     Content: short description, then a tools spec list (see Content).
  4. Option selector: "Size" or "Model" chips (use the variant names from the product data).
  5. Quantity stepper (− 1 +), black square buttons as in the reference.
  6. Two buttons side by side: "Add to Cart" (outline style) and "Buy Now" (primary filled style).
  7. "Delivery & Returns" accordion box with four items in a 2×2 grid:
     Delivery time, Estimated arrival date, Return policy, Warranty.
- Below both columns, full width:
  8. "Rating & Reviews" heading
  9. Left: average rating (large number, "/5"), total review count, and five rating bars.
  10. Right: review card showing name, star rating, date, review text, and a small pager
      when there are more reviews.
  11. "Similar Products" row (see Behavior).

Mobile (390px): single column. Order: image, thumbnails, name, price, description,
options, quantity, buttons, delivery box, reviews, similar products. Buttons are full
width and stacked: Buy Now above Add to Cart. The sticky bar at the bottom (see Behavior)
keeps the price and Buy Now visible while scrolling.

## Visual
- Follow DESIGN.md and globals.css tokens for all colors, radius, spacing and fonts.
- "Buy Now" uses the primary token (the same orange/blue as the site's main button).
- "Add to Cart" uses the outline button style from DESIGN.md.
- Cards, accordion boxes and review cards use the surface token with a thin border and the
  same radius as product cards.
- Rating stars use the accent/warning token. No hex colors.
- Do not copy the chair photos, product names, reviewer names, or text from the reference.

## Content (from apps/web/lib/products.ts)
Each product has: id, name, slug, category, brand, price, originalPrice (optional),
onSale, images[] (at least 1, max 4), variants[] (name, value, price, stock),
shortDescription, specs[] (label and value pairs), inBox[] (list of items),
deliveryDays, warrantyText, returnPolicy, and reviews[].

Description box shows:
- shortDescription (2 to 3 lines)
- Specs table with label and value rows, for example: Model, Power (W), Speed (RPM),
  Weight (kg), Material, Warranty
- "What's in the box" list, for example: 1 × Drill, 1 × Side handle, 1 × Carry case

Rules:
- Only show specs and "in the box" items that exist in the product data. If a field is
  missing, hide that row, never show a placeholder.
- Show a rating only when the product has at least 1 real review. If there are no reviews,
  show "No reviews yet" and skip the rating bars.
- Average rating is calculated from the real review list. Never hardcode it.
- The "Estimated arrival" date is calculated from deliveryDays and today's date.
  Do not show a fixed date.

## Behavior
- Thumbnail click swaps the main image. Arrow keys move through images when the gallery is focused.
- Option chips: selecting one updates the price and the stock message. Out-of-stock options
  are shown disabled with "Out of stock".
- Quantity: minimum 1, maximum is the stock for the selected option.
- Add to Cart: adds the selected option and quantity to the cart. Cart state is handled
  in a later spec; for now, show a confirmation message only.
- Buy Now: goes to /checkout with the selected option and quantity (placeholder page is fine).
- Accordions: Description and Delivery & Returns open and close, and work with keyboard
  (Enter or Space).
- Review pager: shows 1 review at a time and moves between reviews with arrows or swipe.
- Similar Products: 4 product cards from the same category, excluding the current product.
  Reuse the product card component from the Best Sellers spec. If fewer than 2 similar
  products exist, hide the section.
- Mobile sticky bar: shows price and Buy Now, fixed to the bottom, and appears only after
  the user scrolls past the buttons.
- Unknown slug: show a "Product not found" page with a link back to the home page.

## Done when
- [ ] Desktop (1440px) matches the reference layout: image gallery left, info right,
      reviews and similar products below
- [ ] Mobile (390px) is a single column in the order listed, with no horizontal page scroll
- [ ] Buy Now uses the primary style, and no hex colors appear in any component
- [ ] Description box shows only real specs and in-box items from the product data
- [ ] Rating and review count are calculated from real reviews; "No reviews yet" shows when empty
- [ ] Options, quantity and stock limits work and update the price
- [ ] Similar Products excludes the current product and hides when fewer than 2 are found
- [ ] Sticky bar appears on mobile after scrolling past the buttons
- [ ] Unknown slug shows "Product not found"
- [ ] No console errors
- [ ] npm run lint and npm run check-types pass