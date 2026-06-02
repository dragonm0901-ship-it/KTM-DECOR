import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    qualities: [75, 90],
  },
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
    return [
      {
        source: "/admin",
        destination: "/admin/",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const DASHBOARD_URL = process.env.DASHBOARD_URL || "http://127.0.0.1:5173";
    return [
      {
        source: "/admin/:path*",
        destination: `${DASHBOARD_URL}/admin/:path*`,
      },
    ];
  },
};

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default analyzer(nextConfig);
