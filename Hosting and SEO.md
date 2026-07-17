# Hosting and SEO Strategy for KTM DECOR

This document outlines the recommended infrastructure, hosting configuration, and SEO optimization strategy for migrating the KTM DECOR website from a temporary Vercel subdomain to a custom `.com` domain.

---

## 1. Hosting Architecture Recommendation

### Vercel Pro Plan (Highly Recommended)

Since the KTM DECOR website is built with **Next.js**, Vercel is the optimal hosting platform.

- **Next.js Native Optimization:** Vercel automatically manages Next.js serverless functions, API routes, middleware, and edge routing.
- **Global Edge Network (CDN):** Pages and static assets are cached globally at Edge network hubs. For users in Nepal, traffic is routed through nearby APAC servers, ensuring sub-second page load times.
- **Built-in Image Optimization:** The website utilizes Next.js `<Image />` components to automatically crop, compress, and serve modern web formats (WebP/AVIF). Vercel provides this optimization automatically.
- **Automatic SSL & DNS:** Vercel automatically generates and renews Let's Encrypt SSL certificates (HTTPS) for your custom domain, a critical ranking factor for search engines.

> [!WARNING]
> **Plan Compliance:** The Vercel Hobby (Free) plan does not permit commercial use under Vercel's terms. For a live business like KTM DECOR, you should transition to the **Vercel Pro Plan ($20/month per member)** once the custom domain is launched.

### Alternative: Self-Hosting on VPS (DigitalOcean, AWS)

If you want to avoid Vercel's subscription costs, you can host Next.js on a VPS ($5–$10/month) using Docker or PM2.

- **Pros:** Lower long-term fixed cost, no bandwidth markup.
- **Cons:** Requires manual dev-ops management: Nginx reverse proxies, manual SSL certificate renewal (Certbot), deployment scripts, and setting up an external CDN (e.g., Cloudinary) for image optimization.

---

## 2. Transitioning to a Custom `.com` Domain

When purchasing and linking your new `.com` domain:

1.  **Registering the Domain:** Use a registrar with fast DNS propagation and free privacy protection, such as **Namecheap** or **Cloudflare**.
2.  **DNS Configuration:**
    - Add your domain in the Vercel dashboard (`Settings > Domains`).
    - Point your domain's CNAME and A records (or Nameservers) to Vercel's endpoints as instructed by Vercel.
3.  **Canonical Redirects (WWW vs. Non-WWW):**
    - Having both `decorktm.com` and `www.decorktm.com` load separately creates duplicate content issues, which hurts SEO.
    - Set **one** (typically `www.decorktm.com`) as the primary domain in Vercel, and configure the other to automatically redirect to it.

---

## 3. SEO Checklist for Next.js

Next.js provides excellent out-of-the-box SEO because it pre-renders HTML on the server. Follow this checklist to maximize search engine indexing and ranking:

### 1. Sitemap Generation

Create a dynamic sitemap file in your project to help Google index products automatically.

- **File location:** `src/app/sitemap.ts` (Next.js will compile this to `/sitemap.xml`).
- Ensure it dynamically maps all static pages (Home, Gallery, About) and all dynamic products fetched from the database/data store.

### 2. Robots.txt Configuration

Create a `robots.txt` file in `src/app/robots.ts` or `public/robots.txt`:

```text
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://www.yourdomain.com/sitemap.xml
```

### 3. Page Metadata

Ensure every page route includes unique metadata tags for descriptive browser titles and search descriptions.

```typescript
export const metadata = {
  title: "KTM DECOR | Custom LED Neon Signs & 3D Signage in Kathmandu",
  description:
    "Nepal's premium manufacturer of custom LED neon signs, backlit illuminated boards, and 3D acrylic corporate lettering. Free Valley installation & 1-year warranty.",
  openGraph: {
    title: "KTM DECOR | Premium LED Neon Signs & Signage",
    description:
      "Order premium custom LED neon signs and illuminated boards online in Nepal.",
    url: "https://www.yourdomain.com",
    siteName: "KTM DECOR",
    images: [
      {
        url: "https://www.yourdomain.com/logo/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};
```

### 4. Search Engine Crawl Verification

Once the custom domain is live:

1.  Verify ownership of the domain in **Google Search Console** (using a DNS TXT record or HTML verification).
2.  Submit the URL `https://www.yourdomain.com/sitemap.xml` directly in Search Console.
3.  Set up **Google Analytics 4 (GA4)** using a tag manager or directly in Next.js layout to monitor organic traffic metrics.
