import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Include knowledge base markdown files in serverless function bundles
  // (required for fs.readFileSync in knowledge-loader.ts on Vercel)
  outputFileTracingIncludes: {
    "/api/ai/vision": ["./knowledge/**/*.md"],
    "/api/ai/feedback": ["./knowledge/**/*.md"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
