import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Unsplash — used for default food cover photos and AI image suggestions
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Generic HTTPS fallback for user-uploaded item images from external CDNs
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
