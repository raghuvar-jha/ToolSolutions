import {
  getSimilarProducts,
  toCardProduct,
  type ProductDetail,
} from "../lib/Products";
import ProductCard from "./product-card";

/**
 * Up to 4 products from the same category (current product excluded), shown
 * with the Best Sellers card. Hidden when fewer than 2 are found.
 */
export default function SimilarProducts({ product }: { product: ProductDetail }) {
  const similar = getSimilarProducts(product, 4);
  if (similar.length < 2) return null;

  return (
    <section aria-labelledby="similar-heading">
      <h2
        id="similar-heading"
        className="text-2xl font-semibold text-text lg:text-[32px]"
      >
        Similar Products
      </h2>
      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-5">
        {similar.map((p) => (
          <li key={p.id}>
            <ProductCard product={toCardProduct(p)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
