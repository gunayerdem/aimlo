import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Include knowledge base markdown files in serverless function bundles
  // (required for fs.readFileSync in knowledge-loader.ts on Vercel)
  outputFileTracingIncludes: {
    "/api/ai/vision": ["./knowledge/**/*.md"],
    "/api/ai/feedback": ["./knowledge/**/*.md"],
    "/api/ai/report": ["./knowledge/**/*.md"],
    "/api/ai/match-report": ["./knowledge/**/*.md"],
    "/api/ai/insight": ["./knowledge/**/*.md"],
  },
  async headers() {
    // Content Security Policy — restricts where scripts/styles/fonts/images
    // can load from, which neutralises most XSS impact even if a content-injection
    // vector slips through. Allowlist below covers what AIMLO actually uses:
    //   - 'self'                      → first-party assets
    //   - https://media.valorant-api.com → agent + map splash images
    //   - https://*.supabase.co       → realtime auth/db requests
    //   - 'unsafe-inline' for styles  → Tailwind + style props (cannot avoid in Next 16 today)
    //
    // Dev mode (Turbopack HMR) injects inline scripts + uses eval() for hot reload.
    // We relax script-src in dev only — production stays strict.
    const isDev = process.env.NODE_ENV !== "production";
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
      : "script-src 'self'";

    const csp = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://media.valorant-api.com https://*.supabase.co",
      "font-src 'self' data:",
      // Server-side AI calls don't need browser connect-src; we list only what
      // the browser actually fetches: Supabase (auth/realtime). OpenAI/Anthropic
      // never called from client. In dev, allow ws:// for Turbopack HMR socket.
      isDev
        ? "connect-src 'self' ws: wss: https://*.supabase.co"
        : "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
