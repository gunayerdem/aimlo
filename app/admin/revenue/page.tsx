import { getCostData } from "@/lib/admin-data";
import { formatUsd } from "@/lib/openai-pricing";

export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {
  const c = await getCostData();
  const revenue = 0; // no payment integration yet
  const profit = revenue - c.total;

  return (
    <>
      <h1 className="adm-h1">Gelir</h1>
      <p className="adm-sub">Para-alma & kârlılık — launch sonrası</p>

      <div className="adm-grid cols-3">
        <div className="adm-card"><p className="adm-stat-label">GELİR (MRR)</p><div className="adm-stat-num">{formatUsd(revenue)}</div><p className="adm-stat-sub">ödeme entegrasyonu yok</p></div>
        <div className="adm-card"><p className="adm-stat-label">AI MALİYETİ (TOPLAM)</p><div className="adm-stat-num">{formatUsd(c.total)}</div></div>
        <div className="adm-card"><p className="adm-stat-label">TAHMİNİ KÂR</p><div className="adm-stat-num iris">{formatUsd(profit)}</div><p className="adm-stat-sub">gelir − AI maliyeti</p></div>
      </div>

      <div className="adm-note" style={{ marginTop: 18 }}>
        <b>Gelir sistemi henüz devrede değil.</b> Şu an aimlo.gg'de ödeme/abonelik entegrasyonu yok — herkes ücretsiz, MRR = $0.
        Ödeme entegrasyonu (Faz 3) eklenince burada şunlar canlanacak:
        <ul style={{ margin: "12px 0 0", paddingLeft: 20, lineHeight: 1.9 }}>
          <li>MRR / ARR, aktif abone sayısı, ARPU</li>
          <li>Kayıt → ödeme dönüşüm oranı</li>
          <li><b>Net kâr = gelir − AI maliyeti</b> (yukarıdaki maliyet sayfasıyla birleşik) → fiyatlama kararı</li>
        </ul>
        <p style={{ marginTop: 14, marginBottom: 0, fontSize: 13, opacity: 0.75 }}>
          Gerekli: ödeme sağlayıcı (Stripe/Paddle/LemonSqueezy) + <code>subscriptions</code> tablosu + imza-doğrulamalı webhook.
          Hazır olunca söyle, kuralım.
        </p>
      </div>
    </>
  );
}
