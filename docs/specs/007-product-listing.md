# Spec: Product listing page

Routes:
- /category/[slug] (from the category banner and nav)
- /products (all products, and search results from the header search)

Both routes render the same page component. The category, search text, price limit and sort
are stored in the URL query string (for example /category/power-tools?max=3000&sort=price-asc&q=drill),
so the back button, refresh and shared links keep the same results.

## Layout (from docs/design/reference/product-listing-reference.png)
Desktop (1440px), inside the shared container:
- Page heading: "All Products" or the category name, in the heading style from DESIGN.md.
  Below it, muted text: "N products available".
- Two columns:
  - Left sidebar (about 260px), white rounded card with a thin border:
    - "Filters" heading, and a "Clear All" link on the right (primary color). Clears all filters.
    - "Category" heading, then a vertical list: All, then one item per category.
      The selected item is bold, with the primary color.
    - "Maximum Price" heading, a range slider with the primary color, and the min and max labels
      below it (₹500 on the left, ₹5000 on the right). The max comes from the highest price in the data.
  - Right column:
    - Search bar: white rounded bar with a search icon, a text input (placeholder "Search tools…"),
      and the item count on the right ("N items"). Sort control on the far right.
    - Product grid: 5 columns, 16px gaps, using the shared product card.
- Sort control: a dropdown labelled "Sort By" with options: Recommended, Price: low to high,
  Price: high to low, Name: A to Z.

Mobile (390px):
- Heading and count at the top.
- Search bar full width, with the Filters button and the Sort control in a row below it.
- Filters open in a bottom sheet with the same sections and an "Apply" button.
- Product grid: 2 columns, 12px gaps.
- No sidebar on mobile.

## Visual
- Follow DESIGN.md and the globals.css tokens for all colors, radius, spacing and fonts.
- Sidebar, search bar and card containers: surface token, thin border, soft shadow, same radius as the
  product cards on the home page.
- Slider, selected category, "Clear All" and the Filters accent use the primary token.
- The "1 Day Delivery" line uses the success token. If DESIGN.md has no success token, add one
  to DESIGN.md and globals.css first, on its own branch, then build this page.
- Use the same product card component as the home page. Do not create a second card.
  The card has two optional parts:
  - `showSaleBadge` (home page: on, this page: on only when the product is on sale)
  - `showDelivery` (this page: on, home page: off)
- Do not use any brand names, logos or product photos from the reference. Use products from
  apps/web/lib/products.ts only.

## Data and behavior
- Products come from apps/web/lib/products.ts. Each product has: name, slug, category, price,
  originalPrice (optional), onSale, deliveryDays (optional), image.
- Category filter: /category/[slug] shows only that category. An unknown slug shows
  "Category not found" with a link back to /products.
- Category sidebar item: clicking it updates the URL and the grid. The "All" item is /products.
- Search: filters by product name, case-insensitive, combined with the other filters.
  The search input updates the URL after a short pause (300ms) so typing doesn't reload the page.
- Price filter: shows products with price less than or equal to the slider value. The slider
  updates the grid on release (desktop) and on Apply (mobile).
- Sort: applies to the filtered results. "Recommended" keeps the order in the data file.
- Count: the heading shows "N products available" and the search bar shows "N items" for the same number.
- Delivery line: shows "✓ 1 Day Delivery" when deliveryDays is 1, otherwise "✓ N Day Delivery".
  Hide the line when deliveryDays is missing. Never show a made-up delivery time.
- Card click: the whole card links to /products/[slug], the product page from the product spec.
  The card is keyboard reachable, and Enter opens the product.
- Hover (desktop): card lifts with a soft shadow, as on the home page.
- Empty state: when no products match, show "No products match your filters" with a
  "Clear filters" button. Do not show a blank grid.
- Price labels use ₹ with Indian digit grouping (₹3,299).
- Images use next/image with width, height and descriptive alt text (the product name).

## Done when
- [ ] Desktop (1440px) matches the reference: sidebar left, search bar and sort right, 5 cards per row
- [ ] Cards use the shared product card component, with the delivery line on this page only
- [ ] Mobile (390px): 2 columns, Filters open in a bottom sheet, no horizontal page scroll
- [ ] Category links, search, price slider and sort all update the grid and the URL
- [ ] Refreshing the page or sharing the URL keeps the same results
- [ ] Clicking a card opens /products/[slug]
- [ ] Empty state and "Category not found" state work
- [ ] Count text matches the number of cards shown
- [ ] No hex colors, no brand names or photos from the reference, no console errors
- [ ] npm run lint and npm run check-types pass