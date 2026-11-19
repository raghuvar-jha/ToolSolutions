import SiteHeader from "../components/Header";
import HeroCarousel from "../components/heroCarousel";
import ProductSections from "../components/Products";

export default function Home() {
  return (
    <main>
      <SiteHeader/>
      <HeroCarousel />
      <ProductSections />
    </main>
  );
}
