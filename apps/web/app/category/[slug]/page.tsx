import type { Metadata } from "next";
import ListingPage from "../../../components/listing/listing-page";
import { getCategory, readFilters, type SearchParams } from "../../../lib/listing";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: getCategory(slug)?.name ?? "Category not found" };
}

/** One category; same page as /products with the category from the path (spec 007). */
export default async function CategoryPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return <ListingPage filters={readFilters(query, slug)} />;
}
