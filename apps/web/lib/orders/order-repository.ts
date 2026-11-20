/**
 * Order storage contract (spec 009). v1 uses a JSON file
 * (json-order-repository.ts); a database implementation can replace it later
 * without touching the API route or pages.
 */
import type { Address } from "@repo/shared/checkout";

export type OrderStatus = "placed" | "pending_payment";
/** pending = COD (collected on delivery) · demo = demo online payment · created/paid = live Razorpay. */
export type PaymentStatus = "pending" | "demo" | "created" | "paid";

export type OrderLine = {
  productId: string;
  variantId: string | null;
  /** Snapshot at order time, so the order still reads correctly if the catalogue changes. */
  name: string;
  variantLabel: string | null;
  slug: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Order = {
  /** Random, unguessable ID used in URLs (v1 has no login). */
  id: string;
  /** Readable number, e.g. "TS-20261120-0001". */
  number: string;
  createdAt: string;
  status: OrderStatus;
  address: Address;
  payment: {
    method: "cod" | "razorpay";
    status: PaymentStatus;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  };
  lines: OrderLine[];
  subtotal: number;
  /** Delivery charge in ₹ (0 while the shipping rule awaits client confirmation). */
  delivery: number;
  deliveryLabel: "free" | "pending" | "charged";
  gst: number;
  gstIncluded: boolean;
  total: number;
  /** ISO date (yyyy-mm-dd). */
  estimatedDelivery: string;
  idempotencyKey: string;
};

/** What a transaction callback returns: the API result, plus an order to insert or replace. */
export type TransactionResult<T> = { result: T; save?: Order };

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByIds(ids: string[]): Promise<Order[]>;
  /**
   * Runs `fn` with exclusive access to all orders (stock checks, idempotency and
   * order numbers stay consistent under concurrent requests) and saves `save`.
   */
  transact<T>(
    fn: (orders: readonly Order[]) => Promise<TransactionResult<T>> | TransactionResult<T>,
  ): Promise<T>;
}

/** localStorage key holding the order IDs placed in this browser (v1 has no login). */
export const BROWSER_ORDERS_KEY = "orders-v1";
