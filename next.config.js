import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {},
  experimental: {
    optimizePackageImports: ["@solar-icons/react", "lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/logo/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, must-revalidate",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, must-revalidate",
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
