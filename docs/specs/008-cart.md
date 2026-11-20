# Spec: Cart page and cart state

Routes:
- /cart (cart page)
- Header cart icon links to /cart and shows the live item count.

## Layout (from docs/design/reference/cart-layout-reference.png)
Desktop (1440px), inside the shared container:
- Heading row: "My Cart" on the left (heading style from DESIGN.md), "Continue Shopping" link on the right.
- Two columns:
  - Left column (about 60%): cart item cards stacked vertically, 16px gap.
  - Right column (about 35%): "Order Summary" card, sticky on scroll.
- Below the cart items, full width: "You may also like" heading and one row of 5 product cards.

Each cart item card (white, thin border, rounded, same radius as product cards):
- Left: product image (square, object-contain, light background), about 120px.
- Middle:
  - Product name (bold)
  - Variant line in muted text (for example "Size M" or "Model X")
  - Stock warning, only when stock is 3 or fewer: "Only 3 left in stock" in the error token,
    with a light error-tinted background bar
  - Delivery line in the success token: "Arrives <date range>", calculated from deliveryDays
  - Returns line in muted text: "Free returns within <N> days" (only when returnDays exists in data)
  - Price row: line total in bold. When quantity is more than 1, show the unit price in
    muted text next to it ("₹49 each").
  - Quantity stepper: − [qty] + in a rounded bordered box, with a minimum of 1
    and a maximum of the stock level.
- Right top: "Save" link with a heart icon.
- Right bottom: trash icon button to remove the item.

Order Summary card:
- "Order Summary" heading
- Promo code field (display-only in version 1, disabled, with a "coming soon" note on hover)
- Subtotal (N items) on the left, amount on the right
- Shipping: "Free" in the success token when the rule in Behavior is met, otherwise the amount
- GST: shown only as "Included in price" or "GST (x%)" with the real amount calculated from gstRate
- Divider, then "Total" in larger text with the amount
- "Continue to checkout" as the primary (dark/primary) full-width button
- "Continue Shopping" as the outline button below it

"You may also like": one row, 5 product cards, using the shared product card with
showDelivery on and showSaleBadge only when on sale. Items come from products in the same
category as the cart items, excluding items already in the cart. If fewer than 5 are found,
fill from other categories. Hide the section if none are found.

Mobile (390px):
- Heading row at the top.
- Cart item cards full width, stacked.
- Order Summary below the items (not sticky), full width.
- "Continue to checkout" is full width and sticky at the bottom of the screen.
- "You may also like" becomes a horizontal scroll row of the same cards.
- No horizontal page scroll.

Empty cart: show "Your cart is empty" with a "Continue Shopping" button linking to /products.
Do not show the summary or the "You may also like" heading when the cart is empty.
(The "You may also like" row still shows on the empty page, as a discovery row, if products exist.)

## Visual
- Follow DESIGN.md and the globals.css tokens for all colors, radius, spacing and fonts.
- Item cards and summary card use the surface token, a thin border and the same radius as product cards.
- Stock warning uses the error token. Delivery line uses the success token.
- "Continue to checkout" uses the primary button style, the same as "Buy Now" on the product page.
- "Continue Shopping" uses the outline button style.
- No hex colors. No brand names, product photos or text from the reference.
- The grey outer frame in the reference is a mockup frame. Do not build it.

## Cart state (React Context)
- File: apps/web/lib/cart/cart-context.tsx, exposing:
  - items
  - addItem(productId, variantId, quantity)
  - updateQuantity(lineId, quantity)
  - removeItem(lineId)
  - clearCart()
  - itemCount (for the header)
  - subtotal, gst and total (calculated from the product data)
- Implemented with useReducer.
- Each cart line stores: lineId, productId, variantId, quantity. Nothing else.
  Name, image, price and stock are looked up from lib/products.ts on render.
- Persisted to localStorage under the key "cart-v1", written on every change.
- Hydration: the cart renders empty on the server and loads from localStorage after mount,
  so server and client HTML match. Show the count as 0 until the cart has loaded.
- If localStorage is unavailable (private mode, blocked), the cart still works in memory
  and does not crash.
- If a stored product no longer exists or has no stock, remove that line on load and show
  a small notice: "Some items were removed because they are no longer available."
- The provider wraps the app in the root layout, so the header and cart page share state.

## Behavior
- Quantity − and +: updates the line and totals immediately. Minimum 1, maximum is the stock level.
- Trash icon: removes the line immediately, with an "Item removed. Undo" message for 5 seconds.
- Save: moves the item out of the cart into a saved list. Saved list page is out of scope for
  version 1, so Save shows "Saved for later" and removes the line from the cart. If the saved
  list is not built yet, make Save display-only and tell me.
- Shipping rule: Free shipping when the subtotal is at least the threshold in lib/shipping.ts.
  The threshold is set by the client. Until it is confirmed, show "Calculated at checkout"
  instead of Free.
- Totals: subtotal is the sum of line totals. GST is calculated per item from its gstRate.
  Show amounts in ₹ with Indian digit grouping (₹3,299).
- "Add to Cart" on the product page: adds the selected variant and quantity to the cart,
  then the header count updates. Show a small confirmation message. If the variant is already
  in the cart, increase its quantity instead of adding a second line, up to the stock level.
- Header cart icon: shows the live count from itemCount. Count is hidden when 0.
- "Continue to checkout" goes to /checkout with the cart. Checkout is a separate spec. It must
  recalculate all prices on the server.
- Keyboard: every button, stepper and link can be reached with Tab and activated with Enter
  or Space. Focus styles are visible.
- Screen readers: stepper buttons have labels ("Decrease quantity", "Increase quantity"),
  and the trash button says "Remove Apex Pro Wireless Headphones".

## Done when
- [ ] Desktop (1440px) matches the reference layout: items left, summary right, recommendations row below
- [ ] Pixel check: spacing, font sizes and alignment match the reference when compared side by side
- [ ] Mobile (390px): stacked layout, sticky checkout button, no horizontal page scroll
- [ ] Quantity, remove and undo work, and totals update immediately
- [ ] Adding from the product page updates the header count and the cart page
- [ ] Cart survives a page refresh
- [ ] Removed or unavailable products are cleaned up with a notice
- [ ] Stock warning shows only at 3 or fewer
- [ ] Empty cart state works
- [ ] Recommendations show 5 products in one row, excluding items already in the cart
- [ ] No hex colors, no brand names or photos from the reference, no console errors
- [ ] npm run lint and npm run check-types pass