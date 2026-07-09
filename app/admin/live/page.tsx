import Link from "next/link";
import { getLiveActivity } from "@/lib/admin-analytics";
import { AutoRefresh } from "../AutoRefresh";

export const dynamic = "force-dynamic";

function ago(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${Math.max(0, s)} sn önce`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} dk önce`;
  return `${Math.floor(m / 60)} sa önce`;
}

export default async function AdminLivePage() {
  const live = await getLiveActivity();

  return (
    <>
      <AutoRefresh seconds={8} />
      <h1 className="adm-h1">
        Canlı <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#22D3EE", marginLeft: 6, boxShadow: "0 0 10px #22D3EE", animation: "none" }} />
      </h1>
      <p className="adm-sub">Maçlarda olanlar — her ölümde anlık düşer · 8 sn'de bir yenilenir (UTC)</p>

      {live.tableMissing ? (
        <div className="adm-note">
          <b>match_events tablosu henüz yok.</b> 0008_match_events.sql migration'ını Supabase SQL Editor'de çalıştır;
          ardından bir sonraki ölümden itibaren canlı akış buraya düşer.
        </div>
      ) : (
        <>
          <div className="adm-grid cols-3">
            <div className="adm-card"><p className="adm-stat-label">ŞU AN ONLINE</p><div className="adm-stat-num iris">{live.onlineNow}</div><p className="adm-stat-sub">son 3 dk'da aktif</p></div>
            <div className="adm-card"><p className="adm-stat-label">AKTİF MAÇ</p><div className="adm-stat-num">{live.activeMatches}</div></div>
            <div className="adm-card"><p className="adm-stat-label">SON OLAYLAR</p><div className="adm-stat-num">{live.events.length}</div><p className="adm-stat-sub">son ölüm/round kayıtları</p></div>
          </div>

          <div className="adm-card" style={{ marginTop: 14, padding: 4 }}>
            <table className="adm-table">
              <thead>
                <tr><th>Zaman</th><th>Oyuncu</th><th>Harita</th><th>Ajan</th><th>Taraf</th><th>Round</th><th>Skor</th><th>Öldüğü yer</th></tr>
              </thead>
              <tbody>
                {live.events.length === 0 ? (
                  <tr><td colSpan={8} style={{ color: "rgba(238,240,248,0.4)", padding: 18 }}>Henüz canlı olay yok — biri oynamaya başlayınca burada görünür.</td></tr>
                ) : (
                  live.events.map((e) => (
                    <tr key={e.id}>
                      <td style={{ color: "rgba(238,240,248,0.55)", whiteSpace: "nowrap" }}>{ago(e.createdAt)}</td>
                      <td>{e.userId ? <Link href={`/admin/users/${e.userId}`}>{e.label}</Link> : e.label}</td>
                      {/* casing artık lib/admin-analytics → format-display'den;
                          CSS capitalize "KAY/O"yu bozuyordu, kaldırıldı */}
                      <td>{e.map ?? "—"}</td>
                      <td>{e.agent ?? "—"}</td>
                      <td style={{ color: "rgba(238,240,248,0.6)" }}>{e.side ?? "—"}</td>
                      <td className="adm-num">{e.roundNo ?? "—"}</td>
                      <td className="adm-num">{e.score ?? "—"}</td>
                      <td style={{ textTransform: "capitalize", color: "rgba(238,240,248,0.6)" }}>{e.deathLoc ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
