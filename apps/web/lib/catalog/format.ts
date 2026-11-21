/** Display helpers. Paise become rupees only here, at display time. */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Formats whole rupees, e.g. 1299 → "₹1,299". */
export const formatInr = (rupees: number) => inr.format(rupees);

/** Formats integer paise with the same helper, e.g. 129900 → "₹1,299". */
export const formatPaise = (paise: number) => formatInr(paise / 100);

/** Product detail page URL: /products/[id]. */
export const productPageHref = (id: string) => `/products/${encodeURIComponent(id)}`;
