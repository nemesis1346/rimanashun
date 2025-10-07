import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure the shared workspace package is transpiled and JSON imports are allowed
  transpilePackages: ["@rimanashun/shared"],
};

export default nextConfig;
