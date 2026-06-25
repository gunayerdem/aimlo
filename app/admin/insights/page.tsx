import { getInsights, type DistRow } from "@/lib/admin-analytics";

export const dynamic = "force-dynamic";

function DistTable({ title, rows }: { title: string; rows: DistRow[] }) {
  return (
    <div className="adm-card" style={{ padding: 4 }}>
      <h3 style={{ padding: "14px 14px 0" }}>{title}</h3>
      <table className="adm-table">
        <thead><tr><th>{title.split(" ")[0]}</th><th className="adm-num">Maç</th><th className="adm-num">Win%</th></tr></thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={3} style={{ color: "rgba(238,240,248,0.4)" }}>Veri yok.</td></tr>
          ) : (
            rows.map((r) => (
              <tr key={r.name}>
                <td style={{ textTransform: "capitalize" }}>{r.name}</td>
                <td className="adm-num">{r.matches}</td>
                <td className="adm-num" style={{ color: r.winRate == null ? "rgba(238,240,248,0.4)" : r.winRate >= 50 ? "#7ee8f7" : "#ff8a95" }}>
                  {r.winRate == null ? "—" : `${r.winRate}%`}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminInsightsPage() {
  const i = await getInsights();

  return (
    <>
      <h1 className="adm-h1">İçgörüler</h1>
      <p className="adm-sub">{i.totalRated} maçtan harita/ajan/taraf dağılımı + kazanma oranları + koçluk kalitesi</p>

      <div className="adm-grid cols-3">
        <div className="adm-card"><p className="adm-stat-label">ORT. KARAR SKORU</p><div className="adm-stat-num iris">{i.avgDecisionScore ?? "—"}</div><p className="adm-stat-sub">decisionScore (koçluk kalitesi sinyali)</p></div>
        <div className="adm-card"><p className="adm-stat-label">ANALİZ EDİLEN MAÇ</p><div className="adm-stat-num">{i.totalRated}</div></div>
        <div className="adm-card">
          <p className="adm-stat-label">TARAF DAĞILIMI</p>
          <div className="adm-chip-row" style={{ marginTop: 8 }}>
            {i.sides.length === 0 ? <span style={{ color: "rgba(238,240,248,0.4)" }}>veri yok</span> :
              i.sides.map((s) => <span key={s.name} className="adm-chip" style={{ textTransform: "capitalize" }}>{s.name}: <b>{s.matches}</b>{s.winRate != null ? ` (${s.winRate}%)` : ""}</span>)}
          </div>
        </div>
      </div>

      <div className="adm-grid cols-2" style={{ marginTop: 14 }}>
        <DistTable title="Harita popülerliği" rows={i.maps} />
        <DistTable title="Ajan popülerliği" rows={i.agents} />
      </div>
    </>
  );
}
