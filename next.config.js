import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [50, 60],
    minimumCacheTTL: 31536000,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@solar-icons/react", "lucide-react", "gsap", "@gsap/react", "motion"],
  },
  async headers() {
    return [
      {
        source: "/(logo|images|products|hero-images)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*\\.(svg|png|jpg|jpeg|webp|avif|woff2|woff)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [];
  },
  async rewrites() {
    const isProd = process.env.NODE_ENV === "production";
    const DASHBOARD_URL = process.env.DASHBOARD_URL;

    if (DASHBOARD_URL) {
      return [
        {
          source: "/admin",
          destination: `${DASHBOARD_URL}/admin/`,
        },
        {
          source: "/admin/:path*",
          destination: `${DASHBOARD_URL}/admin/:path*`,
        },
      ];
    }

    if (!isProd) {
      return [
        {
          source: "/admin",
          destination: "http://127.0.0.1:5173/admin/",
        },
        {
          source: "/admin/:path*",
          destination: "http://127.0.0.1:5173/admin/:path*",
        },
      ];
    }

    return [
      {
        source: "/admin",
        destination: "/admin/index.html",
      },
      {
        source: "/admin/",
        destination: "/admin/index.html",
      },
    ];
  },
};

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default analyzer(nextConfig);
