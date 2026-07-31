import { getCostData } from "@/lib/admin-data";
import { formatUsd } from "@/lib/openai-pricing";
import { TrendChart } from "../AdminChart";

export const dynamic = "force-dynamic";

export default async function AdminCostPage() {
  const c = await getCostData();
  const cacheRatio = c.tokens.input > 0 ? (c.tokens.cached / c.tokens.input) * 100 : 0;

  return (
    <>
      <h1 className="adm-h1">AI Maliyeti</h1>
      <p className="adm-sub">gpt-5-mini token → USD · canlı (girdi $0.25 / çıktı $2.00 / cache $0.025 per 1M)</p>

      {c.rows === 0 ? (
        <div className="adm-note" style={{ marginBottom: 18 }}>
          <b>İzleme yeni devrede.</b> Henüz <code>ai_usage</code> kaydı yok — bir sonraki AI çağrısından (vision/report/feedback/insight)
          itibaren token & maliyet birikmeye başlayacak. Geçmiş çağrılar (DB'ye yazılmadığı için) burada görünmez; launch'a
          kadar gerçek maliyet geçmişi oluşacak.
        </div>
      ) : null}

      {/* Tavan uyarısı (B103, 2026-07-31): getCostData ham satır çekip Node'da
          topluyor; tavana dayanınca TOPLAM sessizce eksik kalırdı. Artık görünür. */}
      {c.truncated ? (
        <div className="adm-note" style={{ marginBottom: 18 }}>
          <b>Toplam EKSİK gösteriliyor.</b> <code>ai_usage</code> okuması {c.rowLimit.toLocaleString("tr")} satır tavanına dayandı;
          yalnız en yeni {c.rowLimit.toLocaleString("tr")} çağrı hesaba katıldı (bugün/bu hafta doğru, <b>toplam</b> düşük).
          Kalıcı çözüm: agregasyonu SQL'e taşıyan RPC.
        </div>
      ) : null}

      <div className="adm-grid cols-4">
        <div className="adm-card"><p className="adm-stat-label">BUGÜN</p><div className="adm-stat-num iris">{formatUsd(c.today)}</div></div>
        <div className="adm-card"><p className="adm-stat-label">BU HAFTA</p><div className="adm-stat-num">{formatUsd(c.week)}</div></div>
        <div className="adm-card"><p className="adm-stat-label">TOPLAM</p><div className="adm-stat-num">{formatUsd(c.total)}</div><p className="adm-stat-sub">{c.rows.toLocaleString("tr")} çağrı</p></div>
        <div className="adm-card"><p className="adm-stat-label">CACHE ORANI</p><div className="adm-stat-num">{cacheRatio.toFixed(0)}%</div><p className="adm-stat-sub">girdi token'ı cache'ten (tasarruf)</p></div>
      </div>

      <div className="adm-grid cols-2" style={{ marginTop: 14 }}>
        <div className="adm-card">
          <h3>Günlük maliyet (son 14 gün, USD)</h3>
          <TrendChart data={c.daily} keys={[{ key: "cost", color: "#FF5E8A", label: "USD" }]} />
        </div>
        <div className="adm-card">
          <h3>Route bazlı dağılım</h3>
          <table className="adm-table">
            <thead><tr><th>Route</th><th className="adm-num">Çağrı</th><th className="adm-num">Maliyet</th></tr></thead>
            <tbody>
              {c.byRoute.length === 0 ? (
                <tr><td colSpan={3} style={{ color: "rgba(238,240,248,0.4)" }}>Veri yok.</td></tr>
              ) : (
                c.byRoute.map((r) => (
                  <tr key={r.route}>
                    <td style={{ textTransform: "capitalize" }}>{r.route}</td>
                    <td className="adm-num">{r.calls.toLocaleString("tr")}</td>
                    <td className="adm-num">{formatUsd(r.cost)}</td>
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
    </>
  );
}
