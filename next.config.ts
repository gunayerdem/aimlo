import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Include knowledge base markdown files in serverless function bundles
  // (required for fs.readFileSync in knowledge-loader.ts on Vercel)
  //
  // ⚠ BU HARİTA KOÇLUĞUN CAN DAMARI: bir AI route'u buradan düşerse Vercel KB
  // dosyalarını bundle'a koymaz, knowledge-loader boş döner ve o route'un
  // feedback'i çöker. Yeni AI route eklerken buraya da ekle.
  //
  // B32 (2026-07-31): "/api/ai/feedback" girdisi KALDIRILDI — route 410 Gone
  // (app/api/ai/feedback/route.ts:658, ROUTE_RETIRED). Sıfır istemcisi olan bir
  // uca ~60K token'lık KB bundle'lamak boşuna bundle şişmesi. Route bir gün
  // canlandırılırsa (ROUTE_RETIRED=false) bu satır GERİ EKLENMELİ.
  outputFileTracingIncludes: {
    "/api/ai/vision": ["./knowledge/**/*.md"],
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
    // Next.js 16 production HTML embeds inline <script> tags carrying the
    // React Server Components payload (self.__next_f.push(...)). Without
    // 'unsafe-inline', browsers block those tags and React never hydrates —
    // the page is stuck on its static loading skeleton.
    //
    // ── B62 (2026-07-31): 'unsafe-inline' BİLEREK duruyor — plan aşağıda ──
    //
    // Denetim önerisi "middleware.ts ile nonce" idi. UYGULANMADI, üç somut
    // sebeple (öneri Next 15 bilgisine dayanıyor, biz Next 16'dayız):
    //
    //  1) Next 16'da `middleware` dosya-konvansiyonu DEPRECATED, adı `proxy.ts`
    //     (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
    //     ilk not). Öneriyi harfiyen uygulamak yanlış dosyayı yaratırdı.
    //  2) Nonce'lu CSP TÜM sayfaları dinamik render'a zorlar: statik üretim ve
    //     CDN cache kapanır, PPR uyumsuz hale gelir
    //     (.../02-guides/content-security-policy.md → "Static vs Dynamic
    //     Rendering with CSP"). Landing bugün statik; bu, launch trafiğinde
    //     doğrudan gecikme + maliyet demek.
    //  3) style-src'ı nonce'a çevirmek bu kod tabanında ölümcül: app/page.tsx
    //     yüzlerce satır inline `style={{...}}` kullanıyor (gradyanlar, mask,
    //     ajan render'ları). Nonce inline STYLE ATTRIBUTE'unu kurtarmaz →
    //     sayfa görsel olarak çöker.
    //
    // Risk kabulü: bugün somut bir enjeksiyon vektörü yok — dangerouslySetInnerHTML
    // kullanılmıyor, React 19 varsayılan escape'i devrede, destek mesajları
    // lib/prompt-safety'den geçiyor. Yani bu bir AÇIK değil, kırılganlık.
    //
    // YAPILACAK (launch sonrası, tek oturum): (a) `proxy.ts` ekle, her istekte
    // crypto tabanlı nonce üretip x-nonce header'ına koy; (b) script-src'ı
    // 'self' 'nonce-X' 'strict-dynamic' yap, style-src'ı 'unsafe-inline'
    // BIRAK (inline style attribute'ları yüzünden); (c) önce
    // Content-Security-Policy-Report-Only ile canlıda ihlal say, sıfırsa
    // enforce'a çevir; (d) statik sayfaların dinamikleşme maliyetini ölç.
    // Bu ikisini birbirine karıştırma: siteyi kırmak, sertleştirmeden kötüdür.
    //
    // Dev ayrıca 'unsafe-eval' ister (Turbopack HMR + React hata yığını).
    const isDev = process.env.NODE_ENV !== "production";
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline'";

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
