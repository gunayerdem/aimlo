import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { DeleteForm } from "./DeleteForm";

export const metadata: Metadata = {
  title: "Hesabı Sil — AIMLO",
  description: "AIMLO hesabını kalıcı olarak sil.",
  robots: { index: false, follow: false },
};

export default async function DeleteAccountPage() {
  const ssr = await createServerSupabase();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-[#030711] text-zinc-200 px-4 py-16 flex items-center justify-center">
      {/* Sitenin tepe paneli — logo/yazıya basınca ana sayfa.
          spacer={false}: main `flex items-center justify-center`; yer tutucu
          burada bir flex öğesi olur ve dikey ortalamayı kaydırırdı. */}
      <SiteHeader spacer={false} />
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          {/* "← Ana Sayfa" bağı kaldırıldı: tepe panelindeki logo aynı işi
              görüyor, ikisi gereksiz tekrar. */}
          <h1 className="text-3xl font-black text-white tracking-tight">
            Hesabı Sil
          </h1>
          <p className="text-sm text-neutral-500">
            Bu işlem geri alınamaz.
          </p>
        </div>

        <div className="rounded-2xl border border-[#FF3D71]/20 bg-[#FF3D71]/[0.04] p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-neutral-300">
              <span className="text-white font-bold">Silinecek:</span>
            </p>
            <ul className="text-[13px] text-neutral-400 list-disc pl-5 space-y-1">
              <li>Hesabın ({user.email})</li>
              <li>Tüm maç analizlerin</li>
              <li>Oyun istatistiklerin (player memory)</li>
              <li>Profil bilgilerin (kullanıcı adı, isim)</li>
            </ul>
          </div>

          <p className="text-[12px] text-[#FF3D71]">
            ⚠ Geri dönüş yok. Aynı e-posta ile tekrar kayıt olabilirsin
            ama mevcut veri tamamen silinir.
          </p>
        </div>

        <DeleteForm />
      </div>
    </main>
  );
}
