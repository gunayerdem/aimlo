import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = {
  title: "Şifremi Unuttum — AIMLO",
  description: "AIMLO şifre sıfırlama.",
  robots: { index: false, follow: false },
};

export default function ForgotPage() {
  return (
    <div className="relative z-10 w-full max-w-[440px] space-y-8 animate-slide-up-big">
      <div className="text-center space-y-5">
        <Link
          href="/login"
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
            Şifremi Unuttum
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            E-postana sıfırlama linki göndereceğiz
          </p>
        </div>
      </div>

      <ForgotForm />

      <p className="text-center text-[13px] text-neutral-500">
        Şifreni hatırladın mı?{" "}
        <Link
          href="/login"
          className="auth-link hover-underline"
        >
          Giriş Yap
        </Link>
      </p>
    </div>
  );
}
