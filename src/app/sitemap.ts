import { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/shop-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://decorktm.com";

  // Define static routes
  const staticRoutes = [
    "",
    "/shop",
    "/start-project",
    "/cookie-policy",
    "/privacy-policy",
    "/terms-of-service",
    "/neon-sign-statistics-nepal",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Generate dynamic product detail page routes
  const productRoutes = PRODUCTS.map((product) => ({
    url: `${baseUrl}/shop/${product.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes];
}
