# Plan: Checkout, payments and orders

Spec: docs/specs/009-checkout.md

- [ ] 1. Add lib/payments.ts (PAYMENT_MODE, COD limit) and .env.example with placeholder keys
- [ ] 2. Add Zod schemas for the address and order request in packages/shared
- [ ] 3. Build the order repository interface with a JSON file implementation in data/ (gitignored)
- [ ] 4. Build POST /api/orders: server recalculation, stock check, COD rule, order number, idempotency
- [ ] 5. Build the checkout page: stepper, address form with validation, read-only summary
- [ ] 6. Build the payment options: COD, and Razorpay in demo mode
- [ ] 7. Wire "Proceed to pay" to the API, clear the cart on success, redirect to /orders/[id]
- [ ] 8. Build /orders and /orders/[id] with the not-found state
- [ ] 9. Add the live Razorpay path (order creation and signature verification), disabled until keys exist
- [ ] 10. Add the mobile layout with sticky button and collapsible summary
- [ ] 11. Check every "Done when" item, then run lint and check-types

Check after each step at 1440px and 390px before moving on.