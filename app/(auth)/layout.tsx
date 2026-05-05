import AuthBg from "./AuthBg";

/**
 * Auth route group layout. Mirrors the styling of the legacy in-page
 * register/login modal in app/page.tsx so the OTP routes look like they've
 * always belonged here:
 *   - bg #030711 base
 *   - <AuthBg /> particle starfield (deterministic positions)
 *   - Decorative orbiting rings behind the form
 *   - card-glow / btn-neon / inputCls patterns provided in pages
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#030711] relative flex items-center justify-center px-4 py-12 overflow-hidden">
      <AuthBg />

      {/* Decorative orbiting rings */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-30"
      >
        <div className="absolute inset-0 rounded-full border border-[#FF4655]/[0.04] animate-rotate-slow" />
        <div
          className="absolute inset-16 rounded-full border border-[#4D7CFF]/[0.03] animate-rotate-slow"
          style={{
            animationDirection: "reverse",
            animationDuration: "30s",
          }}
        />
      </div>

      {children}
    </main>
  );
}
