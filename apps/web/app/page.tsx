import SiteHeader from "../components/Header";
import HeroCarousel from "../components/heroCarousel";
import ProductSections from "../components/Products";
import Footer from "../components/footer";
import ProductGrid from "../components/product-grid";
import CertificatesSection from "../components/certificates-section";
import { BEST_SELLERS } from "../lib/Products";

export default function Home() {
  return (
    <>
      <main>
        <SiteHeader/>
        <HeroCarousel />
        <ProductGrid title="BEST SELLER" products={BEST_SELLERS} />
        
        <CertificatesSection />
      </main>
      <Footer />
    </>
  );
}
