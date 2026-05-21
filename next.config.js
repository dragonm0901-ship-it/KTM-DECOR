/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    qualities: [75, 90],
  },
};

export default nextConfig;
