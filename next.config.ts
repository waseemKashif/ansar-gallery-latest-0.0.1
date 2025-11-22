import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.ansargallery.com",
        pathname: "/**",
      },
    ],
    domains: ["media-qatar.ansargallery.com", "demo1.testuatah.com"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    cacheComponents: false,
  },
};

export default nextConfig;
