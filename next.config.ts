import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Images configuration
  images: {
    domains: [],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [];
  },
};

export default nextConfig;