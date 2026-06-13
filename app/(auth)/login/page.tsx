import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Giriş Yap — AIMLO",
  description: "AIMLO'ya giriş yap — 6 haneli kod ile.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string; reset?: string }>;
}) {
  const sp = await searchParams;
  const justConfirmed = sp.confirmed === "1";
  const justReset = sp.reset === "success";

  return (
    <div className="relative z-10 w-full max-w-[440px] space-y-8 animate-slide-up-big">
      <div className="text-center space-y-5">
        <Link
          href="/"
          className="mx-auto inline-flex items-center gap-2 text-[12px] text-neutral-500 transition hover:text-[#22D3EE] hover-underline"
        >
          ← Geri
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/aimlo-logo.png?v=3"
          alt="AIMLO"
          style={{ height: 42, width: "auto" }}
          draggable={false}
          className="auth-logo mx-auto"
        />
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Giriş Yap
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Yapay Zeka Destekli Valorant Koçun
          </p>
        </div>
      </div>

      {(justConfirmed || justReset) && (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-3 text-center animate-scale-in">
          <p className="text-xs text-emerald-300 font-semibold">
            {justConfirmed
              ? "✓ E-posta doğrulandı! Şifrenle giriş yapabilirsin."
              : "✓ Şifren güncellendi! Yeni şifrenle giriş yap."}
          </p>
        </div>
      )}

      <LoginForm />

      <p className="text-center text-[13px] text-neutral-500">
        Hesabın yok mu?{" "}
        <Link
          href="/register"
          className="auth-link hover-underline"
        >
          Kayıt Ol
        </Link>
      </p>
    </div>
  );
}
