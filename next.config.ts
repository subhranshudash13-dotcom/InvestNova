import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // @ts-ignore
    ignoreBuildErrors: true,
  },
  eslint: {
    // @ts-ignore
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
