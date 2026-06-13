import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { VerifyForm } from "./VerifyForm";

export const metadata: Metadata = {
  title: "E-posta Doğrula — AIMLO",
  description: "AIMLO doğrulama kodunu gir.",
  robots: { index: false, follow: false },
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; purpose?: string }>;
}) {
  const sp = await searchParams;
  const email = (sp.email ?? "").trim().toLowerCase();
  const purpose = sp.purpose === "login" ? "login" : "register";

  if (!email || !email.includes("@")) {
    redirect("/login");
  }

  return (
    <div className="relative z-10 w-full max-w-[440px] space-y-8 animate-slide-up-big">
      <div className="text-center space-y-5">
        <Link
          href={purpose === "login" ? "/login" : "/register"}
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
            E-posta Doğrula
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            <span className="text-neutral-300">{email}</span>
          </p>
          <p className="mt-1 text-[12px] text-neutral-400">
            Adresine 6 haneli bir kod gönderdik
          </p>
        </div>
      </div>

      <VerifyForm email={email} purpose={purpose} />
    </div>
  );
}
