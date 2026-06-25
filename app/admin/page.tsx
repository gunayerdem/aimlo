import Link from "next/link";
import { getOverview } from "@/lib/admin-data";
import { formatUsd } from "@/lib/openai-pricing";
import { TrendChart } from "./AdminChart";

// Admin data is live + per-request — never statically cache.
export const dynamic = "force-dynamic";

function rel(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  const d = Math.floor(h / 24);
  return `${d} gün önce`;
}

function Stat({ label, value, sub, iris }: { label: string; value: string; sub?: string; iris?: boolean }) {
  return (
    <div className="adm-card">
      <p className="adm-stat-label">{label}</p>
      <div className={iris ? "adm-stat-num iris" : "adm-stat-num"}>{value}</div>
      {sub ? <p className="adm-stat-sub">{sub}</p> : null}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const o = await getOverview();

  return (
    <>
      <h1 className="adm-h1">Genel Bakış</h1>
      <p className="adm-sub">AIMLO kullanım & sağlık — canlı (UTC)</p>

      <div className="adm-grid cols-4">
        <Stat label="TOPLAM KULLANICI" value={o.totalUsers.toLocaleString("tr")} sub={`${o.confirmedUsers} email onaylı`} iris />
        <Stat label="TOPLAM MAÇ" value={o.totalMatches.toLocaleString("tr")} sub={`bugün ${o.matchesToday} · bu hafta ${o.matchesWeek}`} />
        <Stat label="AKTİF (DAU/WAU/MAU)" value={`${o.dau} / ${o.wau} / ${o.mau}`} sub="maç atan benzersiz kullanıcı" />
        <Stat label="AI MALİYETİ (BUGÜN)" value={formatUsd(o.costToday)} sub={o.costRows === 0 ? "izleme yeni başladı — veri birikiyor" : `toplam ${formatUsd(o.costTotal)}`} iris />
      </div>

      <div className="adm-grid cols-2" style={{ marginTop: 14 }}>
        <div className="adm-card" style={{ gridColumn: "span 1" }}>
          <h3>Günlük maç trendi (son 14 gün)</h3>
          <TrendChart
            data={o.dailyTrend}
            keys={[
              { key: "matches", color: "#A855F7", label: "Maç" },
              { key: "users", color: "#22D3EE", label: "Kullanıcı" },
            ]}
          />
        </div>

        <div className="adm-card">
          <h3>En aktif 5 kullanıcı</h3>
          <table className="adm-table">
            <thead>
              <tr><th>Kullanıcı</th><th className="adm-num">Maç</th><th>Son aktivite</th></tr>
            </thead>
            <tbody>
              {o.topUsers.length === 0 ? (
                <tr><td colSpan={3} style={{ color: "rgba(238,240,248,0.4)" }}>Henüz maç yok.</td></tr>
              ) : (
                o.topUsers.map((u) => (
                  <tr key={u.userId}>
                    <td><Link href={`/admin/users/${u.userId}`}>{u.label}</Link></td>
                    <td className="adm-num">{u.matches}</td>
                    <td style={{ color: "rgba(238,240,248,0.55)" }}>{rel(u.lastSeen)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Link href="/admin/users" className="adm-link" style={{ display: "inline-block", marginTop: 12 }}>
            Tüm kullanıcılar →
          </Link>
        </div>
      </div>
    </>
  );
}
