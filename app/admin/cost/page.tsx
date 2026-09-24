import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { getCostData } from "@/lib/admin-data";
import { formatUsd, resolvePricing, FALLBACK_PRICING_KEY } from "@/lib/openai-pricing";
import { AI_MODEL } from "@/lib/ai-model";
import { TrendChart } from "../AdminChart";

export const dynamic = "force-dynamic";

// Alt başlık model adı + oranları TEK KAYNAKTAN (B07 · OLCUM-ARACI-17): eskiden
// "gpt-5-mini … $0.25 / $2.00 / $0.025" elle yazılıydı, model göçünde yalan söylerdi.
// Biçim bugünküyle bayt-aynı: 0.25 → "0.25", 2 → "2.00", 0.025 → "0.025".
const rate = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

export default async function AdminCostPage() {
  // GÜVENLİK (canlı sızıntı, 24.09.2026): layout.tsx'teki notFound() kapısı bu
  // sayfanın veri çekimini DURDURMAZ — Next 16 layout ve page segmentlerini paralel
  // render ediyor; layout 404 atsa da page'in RSC verisi yanıtta gidiyordu
  // (kimliksiz GET + "RSC: 1" başlığıyla 200). Kapı bu yüzden veri çekiminden
  // ÖNCE burada da tekrarlanır (revenue/altyapi kalıbı). scripts/test-admin-gate.ts
  // her admin page'inin ilk await'inin getAdminUser olduğunu kilitler.
  const admin = await getAdminUser();
  if (!admin) notFound();

  const c = await getCostData();
  const cacheRatio = c.tokens.input > 0 ? (c.tokens.cached / c.tokens.input) * 100 : 0;
  // W2 inceleme B07-F1: PRICING[AI_MODEL] satırı yoksa (göçte unutulan satır / tarihli pin)
  // eskiden `p.inputPerM` TypeError → sayfa 500. resolvePricing ASLA undefined dönmez;
  // satır yoksa tahmini fiyat + başlıkta açık uyarı.
  const pr = resolvePricing(AI_MODEL);
  const p = pr.pricing;

  return (
    <>
      <h1 className="adm-h1">AI Maliyeti</h1>
      <p className="adm-sub">{`${AI_MODEL} token → USD · canlı (girdi $${rate(p.inputPerM)} / çıktı $${rate(p.outputPerM)} / cache $${rate(p.cachedInputPerM)} per 1M)${pr.known ? "" : " · fiyat satırı yok — TAHMİNİ"}`}</p>

      {/* OLCUM-ARACI-16 (B07, 2026-09-24): fiyat tablosunda olmayan model id'li
          çağrılar eskiden SESSİZCE fallback fiyatıyla sayılıyordu (yazım hatalı id
          7,7× eksik fiyat ölçüldü). Artık görünür; kurtarma = tabloya satır eklemek. */}
      {c.unpriced > 0 ? (
        <div className="adm-note" style={{ marginBottom: 18 }}>
          <b>{c.unpriced.toLocaleString("tr")} çağrı bilinmeyen modelle tahmini fiyatlandı.</b> Fiyat tablosunda olmayan
          model id&apos;si ({c.unpricedModels.join(", ")}) {FALLBACK_PRICING_KEY} fiyatıyla sayıldı — toplam gerçek maliyetten sapabilir.
          Düzeltme: <code>lib/openai-pricing.ts</code> PRICING tablosuna o id&apos;nin satırını ekle.
        </div>
      ) : null}

      {c.rows === 0 ? (
        <div className="adm-note" style={{ marginBottom: 18 }}>
          <b>İzleme yeni devrede.</b> Henüz <code>ai_usage</code> kaydı yok — bir sonraki AI çağrısından (vision/report/feedback/insight)
          itibaren token & maliyet birikmeye başlayacak. Geçmiş çağrılar (DB&apos;ye yazılmadığı için) burada görünmez; launch&apos;a
          kadar gerçek maliyet geçmişi oluşacak.
        </div>
      ) : null}

      {/* Tavan uyarısı (B103, 2026-07-31): getCostData ham satır çekip Node'da
          topluyor; tavana dayanınca TOPLAM sessizce eksik kalırdı. Artık görünür. */}
      {c.truncated ? (
        <div className="adm-note" style={{ marginBottom: 18 }}>
          <b>Toplam EKSİK gösteriliyor.</b> <code>ai_usage</code> okuması {c.rowLimit.toLocaleString("tr")} satır tavanına dayandı;
          yalnız en yeni {c.rowLimit.toLocaleString("tr")} çağrı hesaba katıldı (bugün/bu hafta doğru, <b>toplam</b> düşük).
          Kalıcı çözüm: agregasyonu SQL&apos;e taşıyan RPC.
        </div>
      ) : null}

      <div className="adm-grid cols-4">
        <div className="adm-card"><p className="adm-stat-label">BUGÜN</p><div className="adm-stat-num iris">{formatUsd(c.today)}</div></div>
        <div className="adm-card"><p className="adm-stat-label">BU HAFTA</p><div className="adm-stat-num">{formatUsd(c.week)}</div></div>
        <div className="adm-card"><p className="adm-stat-label">TOPLAM</p><div className="adm-stat-num">{formatUsd(c.total)}</div><p className="adm-stat-sub">{c.rows.toLocaleString("tr")} çağrı</p></div>
        <div className="adm-card"><p className="adm-stat-label">CACHE ORANI</p><div className="adm-stat-num">{cacheRatio.toFixed(0)}%</div><p className="adm-stat-sub">girdi token&apos;ı cache&apos;ten (tasarruf)</p></div>
      </div>

      <div className="adm-grid cols-2" style={{ marginTop: 14 }}>
        <div className="adm-card">
          <h3>Günlük maliyet (son 14 gün, USD)</h3>
          <TrendChart data={c.daily} keys={[{ key: "cost", color: "#FF5E8A", label: "USD" }]} />
        </div>
        <div className="adm-card">
          <h3>Route bazlı dağılım</h3>
          <table className="adm-table">
            {/* F5+F39 (pano dalga, 2026-08-04): route × cache-oranı kırılımı —
                hangi route prompt-cache'ten faydalanamıyor, tek bakışta görünsün
                (cache %'si düşük route = KB/prompt sıralaması bozulmuş demek). */}
            <thead><tr><th>Route</th><th className="adm-num">Çağrı</th><th className="adm-num">Maliyet</th><th className="adm-num">Cache</th></tr></thead>
            <tbody>
              {c.byRoute.length === 0 ? (
                <tr><td colSpan={4} style={{ color: "rgba(238,240,248,0.4)" }}>Veri yok.</td></tr>
              ) : (
                c.byRoute.map((r) => (
                  <tr key={r.route}>
                    <td style={{ textTransform: "capitalize" }}>{r.route}</td>
                    <td className="adm-num">{r.calls.toLocaleString("tr")}</td>
                    <td className="adm-num">{formatUsd(r.cost)}</td>
                    <td className="adm-num">{r.cacheRatio != null ? `${r.cacheRatio}%` : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="adm-chip-row" style={{ marginTop: 14 }}>
            <span className="adm-chip">girdi: <b>{(c.tokens.input / 1000).toFixed(0)}K</b></span>
            <span className="adm-chip">çıktı: <b>{(c.tokens.output / 1000).toFixed(0)}K</b></span>
            <span className="adm-chip">cache: <b>{(c.tokens.cached / 1000).toFixed(0)}K</b></span>
          </div>
        </div>
      </div>

      {/* F5+F39 (pano dalga, 2026-08-04): günlük cache trendi — prompt-cache oranı
          günden güne düşüyorsa (ör. KB blok sıralaması değişti, prompt önekleri
          kaydı) maliyet sessizce katlanır; bu grafik onu erkenden gösterir.
          Veri getCostData'nın mevcut 14-günlük serisinden gelir, EK sorgu yok. */}
      <div className="adm-card" style={{ marginTop: 14 }}>
        <h3>Günlük cache oranı (son 14 gün, girdi token&apos;ının %&apos;si)</h3>
        <TrendChart data={c.daily} keys={[{ key: "cachePct", color: "#22D3EE", label: "Cache %" }]} />
      </div>
    </>
  );
}
