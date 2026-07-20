import { Metadata } from "next";
import { PRODUCTS } from "@/data/shop-data";
import ProductDetailClient from "@/components/ProductDetailClient";

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const product = PRODUCTS.find((p) => p.id === resolvedParams.id);
  
  if (!product) {
    return {
      title: "Product Not Found | KTM DECOR",
    };
  }

  const title = `${product.name} | Buy Custom Signage in Nepal | KTM DECOR`;
  const description = `${product.description} Specifications: ${product.specs.slice(0, 3).join(", ")}. Handcrafted in Kathmandu, Nepal.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/shop/${product.id}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://www.decorktm.com/shop/${product.id}`,
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image],
    },
  };
}

export default function Page() {
  return <ProductDetailClient />;
}
