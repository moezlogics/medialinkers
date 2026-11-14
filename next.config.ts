import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["mongoose", "sharp"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 90],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      // The instant audit tool was replaced by a manual audit request (popup form on every page)
      { source: "/free-seo-audit", destination: "/#free-audit", permanent: true },
      { source: "/seo-audit", destination: "/#free-audit", permanent: true },
      { source: "/our-work", destination: "/case-studies", permanent: true },
      { source: "/our-work/:slug", destination: "/case-studies/:slug", permanent: true },
      { source: "/work", destination: "/case-studies", permanent: true },
      { source: "/case-studies/zmobiles-pk", destination: "/case-studies/mobile-store-seo-pakistan", permanent: true },
      { source: "/case-studies/mymobile-pk", destination: "/case-studies/tech-store-seo-pakistan", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Admin panel and APIs must never be indexed
      { source: "/newlogin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/newlogin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
