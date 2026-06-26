import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  async redirects() {
    return [
      // v3: all legacy routes → home
      { source: "/login", destination: "/", permanent: false },
      { source: "/register", destination: "/", permanent: false },
      { source: "/landing", destination: "/", permanent: false },
      { source: "/mvp", destination: "/", permanent: false },
      { source: "/ai", destination: "/", permanent: false },
      { source: "/gex", destination: "/options/gex", permanent: false },
      { source: "/signals", destination: "/", permanent: false },
      { source: "/feed", destination: "/", permanent: false },
      { source: "/scanner/:path*", destination: "/", permanent: false },
      { source: "/stock/:path*", destination: "/", permanent: false },
      { source: "/settings/:path*", destination: "/", permanent: false },
      { source: "/admin/:path*", destination: "/", permanent: false },
      { source: "/cross-market/:path*", destination: "/", permanent: false },
      { source: "/market", destination: "/", permanent: false },
      { source: "/portfolio", destination: "/", permanent: false },
      { source: "/news", destination: "/", permanent: false },
      { source: "/learn", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
