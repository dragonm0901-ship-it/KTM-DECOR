import { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/shop-data";
import { GUIDES } from "@/data/guides-data";
import { PSEO_SERVICES, PSEO_LOCATIONS } from "@/data/pseo-locations-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://decorktm.com";

  // Define static routes
  const staticRoutes = [
    "",
    "/shop",
    "/decor-guides",
    "/start-project",
    "/press",
    "/neon-sign-statistics-nepal",
    "/cookie-policy",
    "/privacy-policy",
    "/terms-of-service",
    "/return-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : route === "/decor-guides" || route === "/press" ? 0.9 : 0.8,
  }));

  // Generate dynamic product detail page routes
  const productRoutes = PRODUCTS.map((product) => ({
    url: `${baseUrl}/shop/${product.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Generate dynamic decor & signage guide routes
  const guideRoutes = GUIDES.map((guide) => ({
    url: `${baseUrl}/decor-guides/${guide.slug}`,
    lastModified: new Date(guide.updatedDate),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // Generate programmatic service + location landing page routes (pSEO Matrix)
  const pseoRoutes: MetadataRoute.Sitemap = [];
  for (const s of PSEO_SERVICES) {
    for (const l of PSEO_LOCATIONS) {
      pseoRoutes.push({
        url: `${baseUrl}/services/${s.slug}/${l.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.85,
      });
    }
  }

  return [...staticRoutes, ...productRoutes, ...guideRoutes, ...pseoRoutes];
}
