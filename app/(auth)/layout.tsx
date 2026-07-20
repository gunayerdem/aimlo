import AuthBg from "./AuthBg";
import AuthStage from "./AuthStage";
import AuthAgents from "./AuthAgents";
import { SiteHeader } from "@/app/_components/SiteHeader";

/**
 * Auth route group layout — Fable 5 / IRIS köklü yenileme (2026-06-13).
 * Eski kırmızı yörünge halkaları yerine canlı iris aurora orbları,
 * derin iris halka katmanı, yıldız alanı ve 3D tilt sahnesi (AuthStage).
 * Mantık/kontrat değişmedi; yalnızca görsel kabuk.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    /* pt-20 (py-12 değil): tepe paneli sabit ve 64px. İçerik dikey ortalandığı
       için KISA ekranlarda kart yukarı çıkıp panelin altına kayıyordu (720px
       yükseklikte ölçüldü: kart üstü 55px, panel altı 65px). Üst boşluğu
       panelden büyük tutunca ortalama panelin ALTINDAKİ alanda yapılıyor,
       kart hiçbir ekran boyunda panele girmiyor. Alt boşluk pb-12 kalıyor. */
    <main className="min-h-screen bg-[#060814] relative flex items-center justify-center px-4 pb-12 pt-20 overflow-hidden">
      {/* Sitenin tepe paneli — logo/yazıya basınca ana sayfa.
          spacer={false}: bu main `flex items-center justify-center` ile
          dikey ortalıyor; yer tutucu burada flex öğesi olup ortalamayı
          kaydırırdı. İçerik zaten ortada olduğu için panel onu örtmez. */}
      <SiteHeader spacer={false} />

      <AuthBg />

      {/* 3D ajanlar — Jett + Neon (landing hero diliyle) */}
      <AuthAgents />

      {/* Canlı iris aurora orbları */}
      <div
        aria-hidden
        className="auth-aurora animate-orb"
        style={{
          width: 640,
          height: 640,
          top: "-14%",
          left: "-12%",
          background: "radial-gradient(circle, rgba(225,77,218,0.16), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="auth-aurora animate-orb"
        style={{
          width: 560,
          height: 560,
          bottom: "-16%",
          right: "-10%",
          background: "radial-gradient(circle, rgba(34,211,238,0.13), transparent 62%)",
          animationDirection: "reverse",
          animationDuration: "18s",
        }}
      />
      <div
        aria-hidden
        className="auth-aurora animate-orb"
        style={{
          width: 460,
          height: 460,
          top: "32%",
          left: "52%",
          background: "radial-gradient(circle, rgba(168,85,247,0.10), transparent 60%)",
          animationDuration: "22s",
        }}
      />

      {/* Derin iris halka katmanı — yavaşça döner */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[660px] h-[660px] pointer-events-none opacity-40"
      >
        <div className="absolute inset-0 rounded-full border border-[#A855F7]/[0.06] animate-rotate-slow" />
        <div
          className="absolute inset-16 rounded-full border border-[#22D3EE]/[0.05] animate-rotate-slow"
          style={{ animationDirection: "reverse", animationDuration: "30s" }}
        />
        <div
          className="absolute inset-32 rounded-full border border-[#FF5E8A]/[0.04] animate-rotate-slow"
          style={{ animationDuration: "70s" }}
        />
      </div>

      <AuthStage>{children}</AuthStage>
    </main>
  );
}
