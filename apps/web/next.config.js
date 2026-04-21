/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@rimanashun/shared"],
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;