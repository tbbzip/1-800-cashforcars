import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
  experimental: {
    globalNotFound: true,
  },
};

export default nextConfig;
