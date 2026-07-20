import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { getCostData } from "@/lib/admin-data";
import { getRevenueData } from "@/lib/billing";
import { formatUsd } from "@/lib/openai-pricing";

export const dynamic = "force-dynamic";

function usd(cents: number): string {
  return formatUsd(cents / 100);
}

export default async function AdminRevenuePage() {
  // Denetim M1 (Next 16 auth rehberi): layout gate'i Partial Rendering'de
  // page'in veri çekimini durdurmaz — service-role sorguları admin kontrolünün
  // ARKASINDA kalsın diye kapı veri çekiminden önce burada da.
  const admin = await getAdminUser();
  if (!admin) notFound();

  const [r, c] = await Promise.all([getRevenueData(), getCostData()]);
  const profitMonth = r.grossMonthCents / 100 - c.week * 4.35; // yaklaşık ay = 4.35 hafta

  return (
    <>
      <h1 className="adm-h1">Gelir</h1>
      <p className="adm-sub">Abonelik geliri, tahsilat ve kârlılık</p>

      <div className="adm-grid cols-3">
        <div className="adm-card">
          <p className="adm-stat-label">MRR</p>
          <div className="adm-stat-num">{usd(r.mrrCents)}</div>
          <p className="adm-stat-sub">{r.activeSubs} aktif abone · ARPU {usd(r.arpuCents)}</p>
        </div>
        <div className="adm-card">
          <p className="adm-stat-label">TAHSİLAT (30 GÜN / TOPLAM)</p>
          <div className="adm-stat-num">{usd(r.grossMonthCents)}</div>
          <p className="adm-stat-sub">toplam {usd(r.grossCents)}</p>
        </div>
        <div className="adm-card">
          <p className="adm-stat-label">TAHMİNİ AYLIK KÂR</p>
          <div className="adm-stat-num iris">{formatUsd(profitMonth)}</div>
          <p className="adm-stat-sub">30g tahsilat − AI maliyeti (haftalık×4.35)</p>
        </div>
      </div>

      {!r.ready && (
        <div className="adm-note" style={{ marginTop: 18 }}>
          <b>Abonelik tabloları henüz veritabanında yok.</b> Kod tarafı hazır ve uykuda —
          canlanması için iki adım:
          <ul style={{ margin: "12px 0 0", paddingLeft: 20, lineHeight: 1.9 }}>
            <li><code>supabase/0011_subscriptions.sql</code> dosyasını Supabase SQL editöründe çalıştır.</li>
            <li>Stripe hesabı açılınca <code>STRIPE_WEBHOOK_SECRET</code> env&apos;ini Vercel&apos;e ekle — webhook (<code>/api/billing/webhook</code>) imza-doğrulamalı, idempotent ve hazır.</li>
          </ul>
        </div>
      )}

      {r.ready && r.activeSubs === 0 && (
        <div className="adm-note" style={{ marginTop: 18 }}>
          <b>Altyapı canlı, henüz abone yok.</b> Checkout kurulurken abonelik{" "}
          <code>metadata.user_id</code> ile açılmalı — webhook eşlemeyi bu alandan yapar.
        </div>
      )}

      {r.recent.length > 0 && (
        <div className="adm-card" style={{ marginTop: 18 }}>
          <p className="adm-stat-label">SON TAHSİLATLAR</p>
          <table className="adm-table">
            <thead>
              <tr><th>Tarih</th><th>Olay</th><th>Tutar</th></tr>
            </thead>
            <tbody>
              {r.recent.map((e, i) => (
                <tr key={i}>
                  <td>{new Date(e.date).toLocaleString("tr-TR")}</td>
                  <td>{e.type}</td>
                  <td className="adm-num">{e.amountCents != null ? usd(e.amountCents) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
