import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Kayıt Ol — AIMLO",
  description: "AIMLO'ya kayıt ol — 6 haneli kod ile.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="relative z-10 w-full max-w-[440px] space-y-8 animate-slide-up-big">
      <div className="text-center space-y-5">
        {/* "← Geri" KALDIRILDI: hedefi "/" idi, tepe panelindeki logo aynı
            işi yapıyor. */}
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
            Kayıt Ol
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Yapay Zeka Destekli Valorant Koçun
          </p>
        </div>
      </div>

      <RegisterForm />

      <p className="text-center text-[13px] text-neutral-500">
        Hesabın var mı?{" "}
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
