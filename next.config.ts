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
    domains: ["media-qatar.ansargallery.com"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    dynamicIO: false,
  },
};

export default nextConfig;
