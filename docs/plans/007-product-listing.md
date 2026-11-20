# Plan: Product listing page

Spec: docs/specs/007-product-listing.md

- [ ] 1. Update the shared product card with the showSaleBadge and showDelivery props.
        Home page output must not change.
- [ ] 2. Add a helper to read and write filters (category, q, max, sort) from the URL in lib/listing.ts
- [ ] 3. Build the route app/category/[slug]/page.tsx and app/products/page.tsx using one shared component
- [ ] 4. Build the desktop sidebar: category list, price slider, Clear All
- [ ] 5. Build the search bar with the item count and the sort dropdown
- [ ] 6. Build the 5-column product grid and the empty state
- [ ] 7. Add the mobile layout: search row, Filters bottom sheet, 2-column grid
- [ ] 8. Wire the URL state: refresh, back button and shared links keep results
- [ ] 9. Check every "Done when" item, then run lint and check-types

Check after each step at 1440px and 390px before moving on.