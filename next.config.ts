import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["https://ansargallery.com"], // Replace with your actual domain
    formats: ["image/webp", "image/avif"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
