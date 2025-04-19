import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['yejwrwsuijxdayshzwvn.supabase.co'],
    unoptimized: true,
  },
  serverExternalPackages: ['bcrypt'],
  experimental: {
    optimizeCss: false,
  }
};

export default nextConfig;
