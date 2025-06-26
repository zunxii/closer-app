import type { NextConfig } from "next";

const nextConfig = {
  typescript: {
    // ✅ Ignore TypeScript build errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // ✅ Ignore ESLint build errors during production builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
