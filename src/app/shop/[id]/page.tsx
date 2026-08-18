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
  const canonicalUrl = `https://www.decorktm.com/shop/${product.id}`;

  return {
    title,
    description,
    keywords: [
      product.name.toLowerCase(),
      `${product.name.toLowerCase()} price in nepal`,
      `${product.category.toLowerCase()} kathmandu`,
      "custom signage nepal",
      "buy neon signs online ktm"
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
      siteName: "KTM DECOR",
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

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const product = PRODUCTS.find((p) => p.id === resolvedParams.id);

  if (!product) {
    return <ProductDetailClient />;
  }

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [
      product.image.startsWith("http")
        ? product.image
        : `https://www.decorktm.com${product.image}`
    ],
    "description": product.description,
    "sku": `KTM-PROD-${product.id}`,
    "brand": {
      "@type": "Brand",
      "name": "KTM DECOR"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.decorktm.com/shop/${product.id}`,
      "priceCurrency": "NPR",
      "price": product.price,
      "priceValidUntil": "2026-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "KTM DECOR"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || 4.9,
      "reviewCount": product.reviewsCount || 34,
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.decorktm.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop",
        "item": "https://www.decorktm.com/shop"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `https://www.decorktm.com/shop/${product.id}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailClient />
    </>
  );
}
