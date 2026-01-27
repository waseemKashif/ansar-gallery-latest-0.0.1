import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.ansargallery.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media-qatar.ansargallery.com",
        pathname: "/**",
      },
    ],
    domains: ["media-qatar.ansargallery.com", "demo1.testuatah.com"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    cacheComponents: false,
  },
  async rewrites() {
    return [
      {
        source: "/api/magento/:path*",
        destination: "https://www.ansargallery.com/en/rest/:path*",
      },
    ];
  },
};

export default nextConfig;
