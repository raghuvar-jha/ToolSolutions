import SiteHeader from "../components/Header";
import HeroCarousel from "../components/heroCarousel";
import ProductSections from "../components/Products";
import Footer from "../components/footer";
import ProductGrid from "../components/product-grid";
import CertificatesSection from "../components/certificates-section";
import { getBestSellers } from "../lib/catalog/product-repository";

export default async function Home() {
  const bestSellers = await getBestSellers();
  return (
    <>
      <main>
        <SiteHeader/>
        <HeroCarousel />
        <ProductGrid title="BEST SELLER" products={bestSellers} />
        
        <CertificatesSection />
      </main>
      <Footer />
    </>
  );
}
