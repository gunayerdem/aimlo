import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSubscriptionState } from "@/lib/billing";
import { FREE_WEEKLY_MATCH_QUOTA } from "@/lib/entitlements";
import { SubscriptionActions } from "./SubscriptionActions";

export const metadata: Metadata = {
  title: "Hesabım — AIMLO",
  description: "Abonelik durumu, ödeme yöntemi ve faturalar.",
  robots: { index: false, follow: false },
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "—";
  }
}

function fmtMoney(cents: number, currency: string): string {
  const v = (cents / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency.toUpperCase() === "TRY" ? `${v} TL` : `${v} ${currency.toUpperCase()}`;
}

const STATUS_TR: Record<string, string> = {
  active: "Aktif",
  trialing: "Deneme sürümü",
  past_due: "Ödeme bekliyor",
  canceled: "İptal edildi",
  incomplete: "Tamamlanmadı",
  unpaid: "Ödenmedi",
};

export default async function AccountPage() {
  const ssr = await createServerSupabase();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) redirect("/login");

  // Abonelik durumu. ready:false → subscriptions tablosu henüz yok (beta).
  const state = await getSubscriptionState(user.id);
  const sub = state.active;

  return (
    <main className="min-h-screen bg-[#030711] px-4 py-16 text-zinc-200">
      <article className="mx-auto max-w-2xl space-y-10">
        <header className="space-y-3 border-b border-white/10 pb-6">
          <Link href="/" className="text-[12px] text-neutral-500 transition hover:text-[#FF6B77]">
            ← Ana Sayfa
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-white">Hesabım</h1>
          <p className="text-sm text-neutral-500">{user.email}</p>
        </header>

        {/* ── Abonelik ── */}
        <section className="space-y-4">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-neutral-400">Abonelik</h2>

          {state.errored ? (
            /* Denetim M2: DB geçici hata verdiyse ne "Pro" ne "ücretsiz" iddia et —
               yanlış "ücretsiz" göstermek kullanıcıyı ikinci kez satın almaya iter. */
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-[13px] leading-relaxed text-neutral-400">
              Abonelik durumun şu an yüklenemedi. Sayfayı yenilemeyi dene; sorun sürerse{" "}
              <a href="mailto:support@aimlo.gg" className="text-[#FF4655] hover:underline">
                support@aimlo.gg
              </a>{" "}
              adresine yaz. <strong className="text-white">Bu bir ödeme sorunu değildir</strong> —
              aboneliğin varsa aynen devam ediyor.
            </div>
          ) : sub ? (
            <div className="space-y-4 rounded-2xl border border-[#FF4655]/30 bg-[#FF4655]/[0.04] p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B77]">AIMLO Pro</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {fmtMoney(sub.amount_cents, sub.currency)}
                    <span className="text-[14px] font-medium text-neutral-500">
                      {sub.billing_interval === "year" ? " / yıl" : " / ay"}
                    </span>
                  </p>
                </div>
                <span className="rounded-full border border-white/[0.12] px-3 py-1 text-[11px] font-bold text-neutral-300">
                  {STATUS_TR[sub.status] ?? sub.status}
                </span>
              </div>

              <dl className="grid gap-2 text-[13px] sm:grid-cols-2">
                <div className="flex gap-2">
                  <dt className="text-neutral-600">Dönem sonu:</dt>
                  <dd className="text-neutral-300">{fmtDate(sub.current_period_end)}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-neutral-600">Yenileme:</dt>
                  <dd className="text-neutral-300">
                    {sub.cancel_at_period_end ? "Kapalı — dönem sonunda biter" : "Otomatik"}
                  </dd>
                </div>
              </dl>

              <SubscriptionActions
                cancelAtPeriodEnd={sub.cancel_at_period_end}
                periodEnd={fmtDate(sub.current_period_end)}
              />
            </div>
          ) : (
            <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Ücretsiz hesap</p>
                <p className="mt-1 text-[14px] text-neutral-300">
                  Haftada {FREE_WEEKLY_MATCH_QUOTA} maç analizi.
                </p>
                <p className="mt-2 text-[12px] text-[#FF6B77]">
                  Beta süresince tüm özellikler sınırsız ve ücretsiz.
                </p>
              </div>
              <Link
                href="/fiyatlandirma"
                className="inline-flex rounded-xl bg-[#FF4655] px-6 py-3 text-[13px] font-bold text-white transition hover:bg-[#FF6B77]"
              >
                AIMLO Pro&apos;ya geç
              </Link>
            </div>
          )}
        </section>

        {/* ── Ödeme yöntemi ── */}
        <section className="space-y-3">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-neutral-400">Ödeme yöntemi</h2>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 text-[13px] text-neutral-400">
            {sub ? (
              <>
                Kartını güncellemek için{" "}
                <a href="mailto:support@aimlo.gg" className="text-[#FF4655] hover:underline">
                  support@aimlo.gg
                </a>{" "}
                adresine yaz — ödeme sağlayıcısı bağlandığında bu ekrandan tek tıkla
                yapabileceksin.
              </>
            ) : (
              "Kayıtlı ödeme yöntemin yok."
            )}
          </div>
        </section>

        {/* ── Faturalar ── */}
        <section className="space-y-3">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-neutral-400">Faturalar</h2>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 text-[13px] text-neutral-400">
            Faturaların ödeme sonrası e-posta ile gönderilir. Geçmiş faturalarına buradan
            erişmek için ödeme sağlayıcısının bağlanmasını bekliyoruz.
          </div>
        </section>

        {/* ── Hesap ── */}
        <section className="space-y-3 border-t border-white/10 pt-6">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-neutral-400">Hesap</h2>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
            <Link href="/legal/iade" className="text-neutral-400 transition hover:text-[#FF6B77]">
              İade ve Cayma Koşulları
            </Link>
            <Link href="/legal/mesafeli-satis" className="text-neutral-400 transition hover:text-[#FF6B77]">
              Mesafeli Satış Sözleşmesi
            </Link>
            <Link href="/account/delete" className="text-neutral-500 transition hover:text-red-400">
              Hesabı sil
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
