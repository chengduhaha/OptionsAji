import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  async redirects() {
    return [
      { source: "/qa", destination: "/ai", permanent: false },
      { source: "/signals", destination: "/", permanent: false },
      { source: "/gex", destination: "/stock/SPY/gex", permanent: false },
      { source: "/insider", destination: "/options/unusual", permanent: false },
      { source: "/market", destination: "/options/unusual", permanent: false },
      { source: "/scanner", destination: "/options/unusual", permanent: false },
      { source: "/feed", destination: "/cross-market/xpoz", permanent: false },
      { source: "/scanner/divergence", destination: "/options/unusual", permanent: false },
    ];
  },
};

export default nextConfig;
