# Spec: Checkout, payments and orders

Routes:
- /checkout (address and payment, one page)
- /orders (order list)
- /orders/[id] (order detail and confirmation)

## Layout (from docs/design/reference/checkout-layout-reference.png)
Desktop (1440px), inside the shared container:
- Progress stepper at the top, centred: Cart (done, check icon), Address (current),
  Payment (next). Connected by a line, filled up to the current step.
- Two columns:
  - Left (about 55%):
    - "Select a delivery address" heading. Address card with radio options.
      Version 1: one saved address form, shown with a radio to select it.
      Include "Add new address" below the form.
    - "Choose Payment Method" heading. Two options as bordered cards with radio buttons:
      - Online payment (Razorpay): logos from Razorpay's brand guidelines, label "UPI, Cards, Netbanking, Wallets".
        Expands to show a short note: "You'll complete payment in a secure window."
      - Cash on Delivery: label "Pay when your order arrives". Shown only when the order is
        under the COD limit.
  - Right (about 40%): "Order Summary" card:
    - Item rows: thumbnail, name, "Estimated delivery by <date>", unit price, quantity (display-only here)
    - "Price Details (N items)" box: one line per item, Delivery charges, GST line, Total Amount
    - Full-width primary button: "Proceed to pay" with arrow icon
- Below the button: small text "Secure checkout" with a lock icon.

Mobile (390px):
- Stepper at the top, compact.
- Single column: address, payment, order summary.
- Order summary collapses to a "Price details" row showing the total, expandable.
- "Proceed to pay" is sticky at the bottom of the screen.
- No horizontal page scroll.

## Visual
- Follow DESIGN.md and the globals.css tokens for colors, radius, spacing and fonts.
- Cards use the surface token, a thin border and the same radius as product cards.
- Selected radio and the stepper's current step use the primary token.
- "Free Delivery" uses the success token.
- "Proceed to pay" uses the primary button style, the same as "Buy Now".
- Form inputs use one input style from DESIGN.md: border token, focus ring in primary,
  error text in the error token.
- Do not copy sample names, addresses, card numbers, product photos or text from the reference.
- The grey frame in the reference is a mockup frame. Do not build it.

## Address form
- Fields: full name, mobile number, email, address line 1, address line 2 (optional),
  city, state (dropdown), pincode, delivery instructions (optional).
- Validation (Zod, in packages/shared): name 2 to 80 characters, mobile exactly 10 digits
  (Indian format), email valid, pincode exactly 6 digits, address line 1 at least 5 characters.
- Errors show under each field, and the first error field gets focus on submit.
- Nothing is saved to the server until the order is placed.

## Payment
- Razorpay mode is set by the environment variable PAYMENT_MODE:
  - "demo": no real payment. The Razorpay option shows a visible "DEMO MODE" label in
    the summary, and completing it marks the order as paid with payment status "demo".
  - "live": opens Razorpay Checkout using RAZORPAY_KEY_ID. Payment is confirmed only
    after the server verifies the signature with RAZORPAY_KEY_SECRET. The frontend
    result is never trusted.
- Keys are read only on the server. Only RAZORPAY_KEY_ID may reach the browser,
  and only in live mode.
- Card, UPI and netbanking details are entered only inside Razorpay's own window.
  This app never asks for or stores card numbers, CVV or expiry dates.
- COD: order status "placed", payment status "pending", payment collected on delivery.
- Missing keys in live mode: Razorpay option is hidden and a notice explains that online
  payment is unavailable. COD still works.

## Order placement (server)
- "Proceed to pay" calls a server action or route handler: POST /api/orders.
- The server:
  1. Validates the address and the payment method.
  2. Reads the cart lines (productId, variantId, quantity) from the request.
  3. Recalculates each line price, stock, GST, delivery charges and total from lib/products.ts.
  4. Rejects the order if any item is out of stock or the quantity exceeds stock.
  5. Rejects COD if the total is above the COD limit.
  6. Creates the order with a readable order number (for example "TS-20261120-0001").
  7. Reduces stock for the items (in demo mode too, so stock stays realistic).
  8. Returns the order ID.
- Double submit: the button disables on click, and the server ignores a repeated request
  with the same idempotency key.
- After success: the cart is cleared, and the user goes to /orders/[id].

## Order pages
- /orders: list of orders with order number, date, total, status and a "View details" link.
  Empty state: "No orders yet" with a link to /products.
- /orders/[id]: confirmation heading ("Order placed"), order number, delivery address,
  payment method and status, items with quantities, price breakdown, and estimated delivery.
- An unknown order ID shows "Order not found".
- Version 1 has no login, so /orders lists orders stored on this browser with the order ID
  only. Account-based order history comes later. Tell me if you want login first.

## Behavior
- Changing the quantity happens in the cart. Checkout shows quantities read-only, with a
  "Edit cart" link.
- If the cart is empty, /checkout redirects to /cart.
- If an item becomes unavailable during checkout, the order is rejected and the user sees
  the notice: "<item> is no longer available. Please update your cart."
- Prices use ₹ with Indian digit grouping (₹3,299).
- Keyboard: all fields, radio options and buttons work with Tab, Enter and Space.
- Screen readers: each radio group has a label, and errors are announced.

## Done when
- [ ] Desktop (1440px) matches the reference: stepper, address and payment left, summary right
- [ ] Pixel check against the reference side by side (spacing, font sizes, alignment, card radius)
- [ ] Mobile (390px): single column, sticky "Proceed to pay", no horizontal scroll
- [ ] Address validation works for each field, and errors show correctly
- [ ] COD order is created, the cart clears, and /orders/[id] shows it
- [ ] Demo Razorpay order is created and marked with payment status "demo"
- [ ] COD option is hidden above the COD limit
- [ ] Server recalculates totals (changing a price in the browser does not change the total)
- [ ] Out-of-stock items reject the order with a clear message
- [ ] Double-clicking "Proceed to pay" creates only one order
- [ ] No card fields exist in this app; no secret keys in the browser bundle
- [ ] Unknown order ID shows "Order not found"
- [ ] No hex colors, no sample data from the reference, no console errors
- [ ] npm run lint and npm run check-types pass