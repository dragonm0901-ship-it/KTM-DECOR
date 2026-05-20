Serving a large catalog of 100+ products with high-resolution images without degrading website performance is a core challenge in modern e-commerce.

Here is how major e-commerce platforms solve this, and the best way to implement it in your Next.js application:

1. Leverage Next.js <Image /> Optimization (Core)
Next.js provides a built-in image optimization API that automatically handles resizing, formatting, and performance best practices.

Automatic Format Selection: It converts heavy JPEGs/PNGs into modern high-compression formats like WebP or AVIF depending on browser support.
Lazy Loading: Next-gen images are lazy-loaded by default. They are only fetched when they scroll near the viewport.
Sizing (sizes attribute): Tell the browser exactly how wide the image will render at different media query breakpoints so it downloads a thumbnail instead of a 4K image.
tsx
import Image from 'next/image';
// In your Product Card component:
<div className="relative aspect-square w-full overflow-hidden">
  <Image
    src={product.imageUrl}
    alt={product.title}
    fill
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    className="object-cover"
    loading="lazy"
  />
</div>
2. External Cloud Hosting & Image CDNs (Highly Recommended)
Storing 100+ high-resolution product images inside your local public/ directory will bloat your Git repository and slow down compilation.

How E-coms do it: They store raw source images on cloud buckets (like AWS S3 or Vercel Blob) and serve them through an Image CDN (like Cloudinary, Imgix, or AWS CloudFront).
On-the-fly transformations: CDNs allow you to request resized images via URL parameters: https://res.cloudinary.com/demo/image/upload/w_300,h_300,c_fill/product.jpg
3. Pagination or Infinite Scroll
Never load and render all 100+ product HTML components into the DOM at once. Too many DOM elements increase memory usage and lower interaction speeds (INP).

Offset Pagination: Render 12 to 24 products per page with standard navigation buttons.
Infinite Scroll (Intersection Observer): Load the first 12 items. Attach an observer to a sentinel element at the bottom of the page. Once the user scrolls close, append the next 12 items.
4. Client-Side Filtering with Small JSON Payloads
For 100–300 products, you do not need a complex database database search query.

Serve a static JSON structure containing the metadata (IDs, names, prices, tags, and CDN image URLs) which is only ~30KB–50KB.
Load this data in a single initial request and run your search filtering, sorting, and tag selections instantly in client memory, avoiding round-trip database queries.
5. Layout Stability (Preventing Cumulative Layout Shift - CLS)
When images load, they can push other page content down, which creates a frustrating user experience (CLS) and degrades SEO scores.

Image Aspect Ratios: Always wrap images in a container with a defined aspect ratio (e.g. aspect-square, aspect-[4/5]) so the browser reserves the exact layout box size before the image has finished downloading.
Skeleton Loaders / Blur-up: Use animated skeleton elements or Next.js placeholder="blur" using tiny base64 blur image strings as a visual placeholder.
Summary of Actions
I've reviewed your current architecture. Since you are using Next.js, the most immediate performance win for scaling your catalog to 100+ items is using Next.js <Image /> with optimized sizes and pagination in your Shop.tsx page. Let me know if you would like me to set up an infinite scroll or pagination system for your shop catalog!