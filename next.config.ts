import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.options-aji.com", pathname: "/api/blog/**" },
      { protocol: "https", hostname: "www.options-aji.com", pathname: "/api/blog/**" },
      { protocol: "https", hostname: "options-aji.com", pathname: "/api/blog/**" },
      // CDN placeholder — enable when media.options-aji.com DNS is configured
      { protocol: "https", hostname: "media.options-aji.com", pathname: "/**" },
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/api/blog/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/api/blog/**" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  async redirects() {
    return [
      { source: "/landing", destination: "/", permanent: false },
      { source: "/mvp", destination: "/", permanent: false },
      { source: "/ai", destination: "/", permanent: false },
      { source: "/gex", destination: "/options/gex", permanent: false },
      { source: "/signals", destination: "/", permanent: false },
      { source: "/feed", destination: "/", permanent: false },
      { source: "/scanner/:path*", destination: "/", permanent: false },
      { source: "/stock/:path*", destination: "/", permanent: false },
      { source: "/settings/:path*", destination: "/", permanent: false },
      { source: "/cross-market/:path*", destination: "/", permanent: false },
      { source: "/market", destination: "/", permanent: false },
      { source: "/portfolio", destination: "/", permanent: false },
      { source: "/news", destination: "/", permanent: false },
      { source: "/learn", destination: "/", permanent: false },
      { source: "/blog/about", destination: "/about", permanent: true },
    ];
  },
};

export default nextConfig;
