"use client";

/**
 * Cart state (spec 008). Each line stores only lineId, productId, variantId and
 * quantity; name, image, price and stock are looked up in the catalog (from the
 * product repository via CatalogProvider) on render. Money is integer paise. Persisted to localStorage ("cart-v1"). The server and the first client
 * render see an empty cart; the stored cart loads after mount (hydration guard).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { useCatalog } from "../catalog/catalog-context";
import type { ProductDetail, ProductVariant } from "../catalog/types";

const STORAGE_KEY = "cart-v1";

export type CartLine = {
  lineId: string;
  productId: string;
  /** The variant's value (e.g. "13 mm"); null for products without variants. */
  variantId: string | null;
  quantity: number;
};

/** A line joined with the current product data. */
export type CartItem = CartLine & {
  product: ProductDetail;
  variant: ProductVariant | null;
  /** Paise. */
  unitPrice: number;
  stock: number;
  /** Paise. */
  lineTotal: number;
};

type Catalog = Map<string, ProductDetail>;

/* Product lookups ---------------------------------------------------- */

const lineIdOf = (productId: string, variantId: string | null) =>
  `${productId}:${variantId ?? ""}`;

function lookup(catalog: Catalog, productId: string, variantId: string | null) {
  const product = catalog.get(productId);
  if (!product) return null;
  if (product.variants.length === 0) {
    return variantId === null
      ? { product, variant: null, unitPrice: product.pricePaise, stock: product.stock }
      : null;
  }
  const variant = product.variants.find((v) => v.value === variantId);
  return variant
    ? { product, variant, unitPrice: variant.pricePaise, stock: variant.stock }
    : null;
}

const stockOf = (catalog: Catalog, line: Pick<CartLine, "productId" | "variantId">) =>
  lookup(catalog, line.productId, line.variantId)?.stock ?? 0;

const clamp = (n: number, max: number) =>
  Math.max(1, Math.min(Math.floor(n), max));

/** GST rate in basis points, or null when the price includes GST (true for all products today). */
const gstRateOf = (product: ProductDetail) =>
  product.gstRateBps !== null && product.gstRateBps > 0 ? product.gstRateBps : null;

/* Reducer ------------------------------------------------------------ */

type State = { lines: CartLine[]; loaded: boolean; removedUnavailable: boolean };

type Action =
  | { type: "hydrate"; stored: unknown }
  | { type: "add"; productId: string; variantId: string | null; quantity: number }
  | { type: "update"; lineId: string; quantity: number }
  | { type: "remove"; lineId: string }
  | { type: "restore"; line: CartLine; index: number }
  | { type: "clear" }
  | { type: "dismissNotice" };

/** Keep only well-formed lines for products that still exist and are in stock. */
function sanitize(catalog: Catalog, stored: unknown): { lines: CartLine[]; dropped: boolean } {
  if (!Array.isArray(stored)) return { lines: [], dropped: false };
  const lines: CartLine[] = [];
  let dropped = false;
  for (const raw of stored) {
    const r = raw as Partial<CartLine> | null;
    const ok =
      r &&
      typeof r.productId === "string" &&
      (typeof r.variantId === "string" || r.variantId === null) &&
      typeof r.quantity === "number" &&
      Number.isFinite(r.quantity);
    const stock = ok ? stockOf(catalog, r as CartLine) : 0;
    if (!ok || stock <= 0) {
      dropped = true;
      continue;
    }
    const { productId, variantId } = r as CartLine;
    const lineId = lineIdOf(productId, variantId);
    if (lines.some((l) => l.lineId === lineId)) continue;
    lines.push({ lineId, productId, variantId, quantity: clamp(r.quantity!, stock) });
  }
  return { lines, dropped };
}

function addTo(
  catalog: Catalog,
  lines: CartLine[],
  productId: string,
  variantId: string | null,
  quantity: number,
) {
  const stock = stockOf(catalog, { productId, variantId });
  if (stock <= 0 || quantity < 1) return lines;
  const lineId = lineIdOf(productId, variantId);
  const existing = lines.find((l) => l.lineId === lineId);
  if (existing) {
    return lines.map((l) =>
      l.lineId === lineId ? { ...l, quantity: clamp(l.quantity + quantity, stock) } : l,
    );
  }
  return [...lines, { lineId, productId, variantId, quantity: clamp(quantity, stock) }];
}

function reducer(catalog: Catalog, state: State, action: Action): State {
  switch (action.type) {
    case "hydrate": {
      // Load once only (React may run the mount effect twice in development).
      if (state.loaded) return state;
      const { lines, dropped } = sanitize(catalog, action.stored);
      // Anything added before the stored cart loaded is merged in, not lost.
      const merged = state.lines.reduce(
        (acc, l) => addTo(catalog, acc, l.productId, l.variantId, l.quantity),
        lines,
      );
      return { lines: merged, loaded: true, removedUnavailable: dropped };
    }
    case "add":
      return {
        ...state,
        lines: addTo(catalog, state.lines, action.productId, action.variantId, action.quantity),
      };
    case "update":
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.lineId === action.lineId ? { ...l, quantity: clamp(action.quantity, stockOf(catalog, l)) } : l,
        ),
      };
    case "remove":
      return { ...state, lines: state.lines.filter((l) => l.lineId !== action.lineId) };
    case "restore": {
      if (state.lines.some((l) => l.lineId === action.line.lineId) || stockOf(catalog, action.line) <= 0) {
        return state;
      }
      const lines = [...state.lines];
      lines.splice(Math.min(action.index, lines.length), 0, action.line);
      return { ...state, lines };
    }
    case "clear":
      return { ...state, lines: [] };
    case "dismissNotice":
      return { ...state, removedUnavailable: false };
  }
}

/* Context ------------------------------------------------------------ */

export type AddResult = {
  /** How many were actually added (less than asked when stock runs out). */
  added: number;
  /** Quantity of this line in the cart afterwards. */
  inCart: number;
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  /** False until the stored cart has loaded (counts show 0 until then). */
  loaded: boolean;
  itemCount: number;
  /** Paise. */
  subtotal: number;
  /** GST in paise; 0 while no product has a GST rate (prices are GST-inclusive). */
  gst: number;
  gstIncluded: boolean;
  /** Paise. */
  total: number;
  /** "Some items were removed because they are no longer available." */
  removedUnavailable: boolean;
  dismissNotice: () => void;
  addItem: (productId: string, variantId: string | null, quantity: number) => AddResult;
  updateQuantity: (lineId: string, quantity: number) => void;
  /** Removes the line and returns it with its position, for Undo. */
  removeItem: (lineId: string) => { line: CartLine; index: number } | null;
  restoreItem: (line: CartLine, index: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { byId: catalog } = useCatalog();
  const boundReducer = useCallback(
    (state: State, action: Action) => reducer(catalog, state, action),
    [catalog],
  );
  const [state, dispatch] = useReducer(boundReducer, {
    lines: [],
    loaded: false,
    removedUnavailable: false,
  });

  // Load once after mount. Private mode / blocked storage: start empty, keep working in memory.
  useEffect(() => {
    let stored: unknown = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      stored = raw ? JSON.parse(raw) : [];
    } catch {
      stored = [];
    }
    dispatch({ type: "hydrate", stored });
  }, []);

  // Write on every change (after loading, so the stored cart is never overwritten by the empty one).
  useEffect(() => {
    if (!state.loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
    } catch {
      // Storage unavailable or full: the cart still works for this visit.
    }
  }, [state.lines, state.loaded]);

  const items = useMemo<CartItem[]>(
    () =>
      state.lines.flatMap((line) => {
        const found = lookup(catalog, line.productId, line.variantId);
        if (!found) return [];
        return [{ ...line, ...found, lineTotal: found.unitPrice * line.quantity }];
      }),
    [catalog, state.lines],
  );

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const gst = items.reduce((sum, i) => {
      const rate = gstRateOf(i.product);
      return rate ? sum + Math.round((i.lineTotal * rate) / 10_000) : sum;
    }, 0);
    const gstIncluded = items.every((i) => gstRateOf(i.product) === null);
    return {
      itemCount: state.loaded ? items.reduce((n, i) => n + i.quantity, 0) : 0,
      subtotal,
      gst,
      gstIncluded,
      total: subtotal + (gstIncluded ? 0 : gst),
    };
  }, [items, state.loaded]);

  const addItem = useCallback(
    (productId: string, variantId: string | null, quantity: number): AddResult => {
      const stock = stockOf(catalog, { productId, variantId });
      const current =
        state.lines.find((l) => l.lineId === lineIdOf(productId, variantId))?.quantity ?? 0;
      const inCart = stock > 0 ? clamp(current + quantity, stock) : 0;
      dispatch({ type: "add", productId, variantId, quantity });
      return { added: Math.max(0, inCart - current), inCart, stock };
    },
    [catalog, state.lines],
  );

  const removeItem = useCallback(
    (lineId: string) => {
      const index = state.lines.findIndex((l) => l.lineId === lineId);
      if (index === -1) return null;
      dispatch({ type: "remove", lineId });
      return { line: state.lines[index]!, index };
    },
    [state.lines],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      loaded: state.loaded,
      ...totals,
      removedUnavailable: state.removedUnavailable,
      dismissNotice: () => dispatch({ type: "dismissNotice" }),
      addItem,
      updateQuantity: (lineId, quantity) => dispatch({ type: "update", lineId, quantity }),
      removeItem,
      restoreItem: (line, index) => dispatch({ type: "restore", line, index }),
      clearCart: () => dispatch({ type: "clear" }),
    }),
    [items, state.loaded, state.removedUnavailable, totals, addItem, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
