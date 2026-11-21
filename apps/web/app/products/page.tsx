import type { Metadata } from "next";
import ListingPage from "../../components/listing/listing-page";
import { getCategories, getProductSummaries } from "../../lib/catalog/product-repository";
import { listingTitle, priceMaxOf, readFilters, type SearchParams } from "../../lib/listing";

type PageProps = { searchParams: Promise<SearchParams> };

/** "All Products", or "Results for “drill”" for a search. */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const [query, products] = await Promise.all([searchParams, getProductSummaries()]);
  return { title: listingTitle(readFilters(query, priceMaxOf(products)).q) };
}

/** All products, and search results (?q=). Filters come from the URL (spec 007). */
export default async function ProductsPage({ searchParams }: PageProps) {
  const [query, products, categories] = await Promise.all([
    searchParams,
    getProductSummaries(),
    getCategories(),
  ]);
  return (
    <ListingPage
      filters={readFilters(query, priceMaxOf(products))}
      products={products}
      categories={categories}
    />
  );
}
