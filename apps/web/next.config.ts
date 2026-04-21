import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@rimanashun/shared"],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
