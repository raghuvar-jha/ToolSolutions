# Plan: Cart page and cart state

Spec: docs/specs/008-cart.md

- [ ] 1. Build the cart context with useReducer and localStorage persistence (lib/cart/)
- [ ] 2. Wrap the root layout with the provider and make the header count live
- [ ] 3. Wire "Add to Cart" on the product page to the context
- [ ] 4. Build the cart page heading, empty state and item card
- [ ] 5. Build quantity stepper, remove with undo, and Save (display-only or saved list)
- [ ] 6. Build the Order Summary card with subtotal, GST, shipping rule and total
- [ ] 7. Build "You may also like" as a 5-column row using the shared product card
- [ ] 8. Add the mobile layout with the sticky checkout button
- [ ] 9. Add the hydration guard and the unavailable-product cleanup
- [ ] 10. Check every "Done when" item, run lint and check-types, then check the home and listing pages still work

Check after each step at 1440px and 390px before moving on.