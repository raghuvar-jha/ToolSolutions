import type { Metadata } from "next";
import ListingPage from "../../components/listing/listing-page";
import { listingTitle, readFilters, type SearchParams } from "../../lib/listing";

type PageProps = { searchParams: Promise<SearchParams> };

/** "All Products", or "Results for “drill”" for a search. */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return { title: listingTitle(readFilters(await searchParams).q) };
}

/** All products, and search results (?q=). Filters come from the URL (spec 007). */
export default async function ProductsPage({ searchParams }: PageProps) {
  return <ListingPage filters={readFilters(await searchParams)} />;
}
