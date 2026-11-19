import SiteHeader from "../components/Header";
import HeroCarousel from "../components/heroCarousel";
import ProductSections from "../components/Products";
import CertificateSection from "../components/Certificate";

export default function Home() {
  return (
    <main>
      <SiteHeader/>
      <HeroCarousel />
      <ProductSections />
      <CertificateSection />
    </main>
  );
}
