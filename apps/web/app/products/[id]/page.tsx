import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../../components/Header";
import Footer from "../../../components/footer";
import ProductGallery from "../../../components/product-gallery";
import ProductInfo from "../../../components/product-info";
import DeliveryBox from "../../../components/delivery-box";
import ProductReviews from "../../../components/product-reviews";
import SimilarProducts from "../../../components/similar-products";
import {
  getProductById,
  getProductReviews,
  getSimilarProducts,
} from "../../../lib/catalog/product-repository";

// Same classes as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return { title: product ? product.name : "Product not found" };
}

/**
 * Product detail page (spec 005). Layout per product-page-layout-reference.png:
 * gallery left, info right (DESIGN.md §5 PDP: 52fr / 48fr, 64px gap), then
 * reviews and similar products. Mobile: one column in the spec's order.
 */
export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  const [reviews, similar] = product
    ? await Promise.all([getProductReviews(product.id), getSimilarProducts(product, 4)])
    : [null, []];

  return (
    <>
      <SiteHeader />
      <main className={`${CONTAINER} py-6 lg:py-10`}>
        {product ? (
          <>
            <div className="grid gap-6 lg:grid-cols-[52fr_48fr] lg:items-start lg:gap-16">
              <ProductGallery images={product.images} name={product.name} />
              <div className="space-y-6">
                <ProductInfo product={product} />
                {/* Only products with delivery data (pd-005 to pd-007 have none yet). */}
                {product.deliveryDays !== null && product.returnPolicy && product.warrantyText && (
                  <DeliveryBox
                    deliveryDays={product.deliveryDays}
                    returnPolicy={product.returnPolicy}
                    warrantyText={product.warrantyText}
                  />
                )}
              </div>
            </div>

            <div className="mt-12 space-y-12 lg:mt-20 lg:space-y-20">
              <ProductReviews reviews={reviews?.reviews ?? []} />
              <SimilarProducts similar={similar} />
            </div>
          </>
        ) : (
          <ProductNotFound />
        )}
      </main>
      <Footer />
      {/* Mobile: room for the sticky buy bar so it never covers the footer. */}
      {product && <div aria-hidden className="h-16 lg:hidden" />}
    </>
  );
}

function ProductNotFound() {
  return (
    <section className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-2xl font-semibold text-text lg:text-[32px]">
        Product not found
      </h1>
      <p className="mt-3 text-body">
        This product doesn&apos;t exist or is no longer available.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-12 items-center rounded-pill bg-brand-950 px-6 text-base font-semibold text-surface hover:bg-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
      >
        Back to home
      </Link>
    </section>
  );
}
