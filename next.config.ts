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
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://challenges.cloudflare.com",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "connect-src 'self' https://api.options-aji.com https://media.options-aji.com https://challenges.cloudflare.com",
          "frame-src 'self' blob: https://challenges.cloudflare.com",
          "object-src 'self' blob:",
          "media-src 'self' https://api.options-aji.com https://media.options-aji.com blob:",
        ].join("; "),
      },
    ];
    return [{ source: "/:path*", headers: securityHeaders }];
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
