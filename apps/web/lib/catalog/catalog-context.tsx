"use client";

/**
 * The catalog for client components (cart, saved items, recommendations).
 * The root layout loads it from the product repository and passes it in.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { toSummary, type ProductDetail, type ProductSummary } from "./types";

type CatalogValue = {
  /** Active products in recommended order. */
  products: ProductDetail[];
  summaries: ProductSummary[];
  byId: Map<string, ProductDetail>;
};

const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({
  products,
  children,
}: {
  products: ProductDetail[];
  children: ReactNode;
}) {
  const value = useMemo<CatalogValue>(
    () => ({
      products,
      summaries: products.map(toSummary),
      byId: new Map(products.map((p) => [p.id, p])),
    }),
    [products],
  );
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
}
