import { PRODUCTS } from "@/data/shop-data";
import ProductDetailClient from "@/components/ProductDetailClient";

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id,
  }));
}

export default function Page() {
  return <ProductDetailClient />;
}
