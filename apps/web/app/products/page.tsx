import type { Metadata } from "next";
import ListingPage from "../../components/listing/listing-page";
import { readFilters, type SearchParams } from "../../lib/listing";

export const metadata: Metadata = { title: "All Products" };

type PageProps = { searchParams: Promise<SearchParams> };

/** All products, and search results (?q=). Filters come from the URL (spec 007). */
export default async function ProductsPage({ searchParams }: PageProps) {
  return <ListingPage filters={readFilters(await searchParams)} />;
}
