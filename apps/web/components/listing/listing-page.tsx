import Link from "next/link";
import SiteHeader from "../Header";
import Footer from "../footer";
import FilterSheet from "./filter-sheet";
import FilterSidebar from "./filter-sidebar";
import ProductGrid from "./product-grid";
import SearchBar from "./search-bar";
import {
  LISTING_PRODUCTS,
  applyFilters,
  countText,
  getCategory,
  hasNarrowingFilters,
  listingHref,
  listingTitle,
  type ListingFilters,
} from "../../lib/listing";

// Same classes as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

/**
 * Shared page for /products and /category/[slug] (spec 007): heading + count,
 * filter sidebar (desktop) or bottom sheet (mobile), search bar, product grid.
 */
export default function ListingPage({ filters }: { filters: ListingFilters }) {
  const category = filters.category ? getCategory(filters.category) : null;
  const missing = filters.category !== null && !category;

  const products = missing ? [] : applyFilters(LISTING_PRODUCTS, filters);
  const count = products.length;
  // "Clear filters": drop search + price first; if only the category is left, go to all products.
  const clearHref = hasNarrowingFilters(filters)
    ? listingHref({ ...filters, q: "", max: null })
    : "/products";

  return (
    <>
      <SiteHeader />
      <main className={`${CONTAINER} py-6 lg:py-10`}>
        {missing ? (
          <CategoryNotFound />
        ) : (
          <>
            <header>
              <h1 className="text-2xl font-semibold text-text lg:text-[32px] lg:leading-tight">
                {listingTitle(filters.q, category?.name)}
              </h1>
              <p className="mt-1 text-[15px] text-muted lg:text-base">
                {countText(count, "product available", "products available")}
              </p>
            </header>

            <div className="mt-5 lg:mt-8 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-8">
              <FilterSidebar filters={filters} />
              <div className="min-w-0">
                <SearchBar
                  filters={filters}
                  count={count}
                  filtersButton={<FilterSheet filters={filters} />}
                />
                <div className="mt-4 lg:mt-6">
                  <ProductGrid products={products} clearHref={clearHref} />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

function CategoryNotFound() {
  return (
    <section className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-2xl font-semibold text-text lg:text-[32px]">
        Category not found
      </h1>
      <p className="mt-3 text-body">
        This category doesn&apos;t exist or is no longer available.
      </p>
      <Link
        href="/products"
        className="mt-6 inline-flex h-12 items-center rounded-pill bg-brand-950 px-6 text-base font-semibold text-surface hover:bg-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
      >
        View all products
      </Link>
    </section>
  );
}
