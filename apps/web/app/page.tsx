import SiteHeader from "../components/Header";
import HeroCarousel from "../components/heroCarousel";
import ProductSections from "../components/Products";
import Footer from "../components/footer";
import ProductGrid from "../components/product-grid";
import CertificatesSection from "../components/certificates-section";
import { getBestSellers, getProductSummaries } from "../lib/catalog/product-repository";

const OUR_PRODUCTS_COUNT = 10;

export default async function Home() {
  const [bestSellers, allProducts] = await Promise.all([
    getBestSellers(),
    getProductSummaries(),
  ]);
  // Temporary: repeat the catalog until we have 10 real products to show.
  const repeats = allProducts.length > 0 ? Math.ceil(OUR_PRODUCTS_COUNT / allProducts.length) : 0;
  const ourProducts = Array.from({ length: repeats }, () => allProducts)
    .flat()
    .slice(0, OUR_PRODUCTS_COUNT);
  return (
    <>
      <main>
        <SiteHeader/>
        <HeroCarousel />
        <ProductGrid title="BEST SELLER" products={bestSellers} />
        <ProductGrid title="OUR PRODUCTS" products={ourProducts} />

        <CertificatesSection />
      </main>
      <Footer />
    </>
  );
}
