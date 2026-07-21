import { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/shop-data";
import { GUIDES } from "@/data/guides-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://decorktm.com";

  // Define static routes
  const staticRoutes = [
    "",
    "/shop",
    "/decor-guides",
    "/start-project",
    "/cookie-policy",
    "/privacy-policy",
    "/terms-of-service",
    "/neon-sign-statistics-nepal",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : route === "/decor-guides" ? 0.9 : 0.8,
  }));

  // Generate dynamic product detail page routes
  const productRoutes = PRODUCTS.map((product) => ({
    url: `${baseUrl}/shop/${product.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Generate dynamic decor & signage guide routes
  const guideRoutes = GUIDES.map((guide) => ({
    url: `${baseUrl}/decor-guides/${guide.slug}`,
    lastModified: new Date(guide.updatedDate),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes, ...guideRoutes];
}

