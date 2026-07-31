import { getGrowth } from "@/lib/admin-analytics";
import { TrendChart } from "../AdminChart";

export const dynamic = "force-dynamic";

function pct(n: number, d: number): string {
  if (d <= 0) return "—";
  return `${Math.round((n / d) * 100)}%`;
}

function FunnelRow({ label, value, of, color }: { label: string; value: number; of: number; color: string }) {
  const width = of > 0 ? Math.max(4, Math.round((value / of) * 100)) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
        <span style={{ color: "rgba(238,240,248,0.8)" }}>{label}</span>
        <span className="adm-num" style={{ color: "rgba(238,240,248,0.6)" }}>{value} · {pct(value, of)}</span>
      </div>
      <div style={{ height: 10, borderRadius: 6, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <div style={{ width: `${width}%`, height: "100%", background: color, borderRadius: 6 }} />
      </div>
    </div>
  );
}

export default async function AdminGrowthPage() {
  const g = await getGrowth();

  return (
    <>
      <h1 className="adm-h1">Büyüme & Retention</h1>
      <p className="adm-sub">Launch/para-alma kararının çekirdeği: geri dönüyorlar mı? (UTC)</p>

      <div className="adm-grid cols-4">
        <div className="adm-card"><p className="adm-stat-label">KAYITLI</p><div className="adm-stat-num iris">{g.registered}</div></div>
        <div className="adm-card"><p className="adm-stat-label">EMAIL ONAYLI</p><div className="adm-stat-num">{g.confirmed}</div><p className="adm-stat-sub">{pct(g.confirmed, g.registered)}</p></div>
        <div className="adm-card"><p className="adm-stat-label">AKTİF (≥1 MAÇ)</p><div className="adm-stat-num">{g.activated}</div><p className="adm-stat-sub">{pct(g.activated, g.registered)} aktivasyon</p></div>
        <div className="adm-card"><p className="adm-stat-label">GERİ DÖNEN</p><div className="adm-stat-num">{g.returning}</div><p className="adm-stat-sub">≥2 farklı günde oynadı (kümülatif)</p></div>
      </div>

      {/* D1/D7 kohort kartı (B52, 2026-07-31): "GERİ DÖNEN" kümülatif ve kohortsuz
          olduğu için zamanla otomatik şişiyor; launch kararının metriği D1'dir.
          D0 = kullanıcının ilk maç günü; payda yalnız penceresi TAM geçmiş
          kullanıcılar (devam eden gün sayılmaz). */}
      <div className="adm-grid cols-2" style={{ marginTop: 14 }}>
        <div className="adm-card">
          <p className="adm-stat-label">D1 RETENTION</p>
          <div className="adm-stat-num iris">{g.d1.rate != null ? `${g.d1.rate}%` : "—"}</div>
          <p className="adm-stat-sub">ilk maçın ertesi günü dönen: {g.d1.returned}/{g.d1.eligible} kullanıcı</p>
        </div>
        <div className="adm-card">
          <p className="adm-stat-label">D7 RETENTION</p>
          <div className="adm-stat-num">{g.d7.rate != null ? `${g.d7.rate}%` : "—"}</div>
          <p className="adm-stat-sub">ilk 7 gün içinde dönen: {g.d7.returned}/{g.d7.eligible} kullanıcı</p>
        </div>
      </div>

      <div className="adm-grid cols-2" style={{ marginTop: 14 }}>
        <div className="adm-card">
          <h3>Dönüşüm hunisi</h3>
          <FunnelRow label="Kayıt oldu" value={g.registered} of={g.registered} color="#A855F7" />
          <FunnelRow label="Email onayladı" value={g.confirmed} of={g.registered} color="#7C5CFF" />
          <FunnelRow label="İlk maçı attı (aktivasyon)" value={g.activated} of={g.registered} color="#4D7CFF" />
          <FunnelRow label="Bağlandı (≥5 maç)" value={g.engaged} of={g.registered} color="#22D3EE" />
          <FunnelRow label="Geri döndü (≥2 gün)" value={g.returning} of={g.registered} color="#22F7A8" />
        </div>
        <div className="adm-card">
          <h3>Günlük kayıt (son 14 gün)</h3>
          <TrendChart data={g.signupTrend} keys={[{ key: "signups", color: "#FF5E8A", label: "Kayıt" }]} />
        </div>
      </div>
    </>
  );
}
