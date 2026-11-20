/**
 * Checkout schemas (spec 009), shared by the checkout form (browser) and
 * POST /api/orders (server). The server always re-validates.
 */
import { z } from "zod";

/** Indian states and union territories, for the address dropdown. */
export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message).optional().default("");

export const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name (at least 2 characters)")
    .max(80, "Name can be at most 80 characters"),
  // Indian mobile: exactly 10 digits, starting 6–9.
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  // Trim first, then check the format.
  email: z
    .string()
    .trim()
    .pipe(z.email("Enter a valid email address").max(120, "Email is too long")),
  line1: z
    .string()
    .trim()
    .min(5, "Enter the house number and street (at least 5 characters)")
    .max(120, "Address line 1 can be at most 120 characters"),
  line2: optionalText(120, "Address line 2 can be at most 120 characters"),
  city: z
    .string()
    .trim()
    .min(2, "Enter your city")
    .max(60, "City can be at most 60 characters"),
  state: z.enum(INDIAN_STATES, "Select your state"),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  instructions: optionalText(200, "Instructions can be at most 200 characters"),
});

export type Address = z.infer<typeof addressSchema>;
export type AddressField = keyof Address;

export const paymentMethodSchema = z.enum(["cod", "razorpay"], "Choose a payment method");
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;

/** One cart line as sent by the browser: identifiers and quantity only, never prices. */
export const orderLineSchema = z.object({
  productId: z.string().min(1).max(40),
  variantId: z.string().min(1).max(40).nullable(),
  quantity: z.number().int().min(1).max(99),
});

export const orderRequestSchema = z.object({
  address: addressSchema,
  paymentMethod: paymentMethodSchema,
  lines: z.array(orderLineSchema).min(1, "Your cart is empty").max(50),
});

export type OrderRequest = z.infer<typeof orderRequestSchema>;

/** Live-mode payment confirmation sent after Razorpay Checkout closes. */
export const paymentVerificationSchema = z.object({
  orderId: z.string().min(1).max(64),
  razorpayOrderId: z.string().min(1).max(64),
  razorpayPaymentId: z.string().min(1).max(64),
  razorpaySignature: z.string().regex(/^[a-f0-9]{64}$/),
});

export type PaymentVerification = z.infer<typeof paymentVerificationSchema>;

/** First error message per field, in form order (for inline errors and focus). */
export function fieldErrors(error: z.ZodError): Partial<Record<string, string>> {
  const out: Partial<Record<string, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !(key in out)) out[key] = issue.message;
  }
  return out;
}
