/**
 * Shipping rule for the cart (spec 008).
 *
 * NEEDS CLIENT CONFIRMATION: the free-shipping threshold and the delivery
 * window below are placeholders. Until SHIPPING_CONFIRMED is true the cart
 * shows "Calculated at checkout" instead of "Free".
 */

/** Placeholder: free shipping from this subtotal (₹). Set by the client. */
export const FREE_SHIPPING_THRESHOLD = 999;

/** Flip to true once the client confirms the threshold. */
export const SHIPPING_CONFIRMED: boolean = false;

/** Placeholder: arrival range = deliveryDays … deliveryDays + this many days. */
export const DELIVERY_WINDOW_DAYS = 2;

export type ShippingQuote = { kind: "free" } | { kind: "pending" };

/** "free" only when the rule is confirmed and met; otherwise priced at checkout. */
export function shippingQuote(subtotal: number): ShippingQuote {
  if (SHIPPING_CONFIRMED && subtotal >= FREE_SHIPPING_THRESHOLD) {
    return { kind: "free" };
  }
  return { kind: "pending" };
}
