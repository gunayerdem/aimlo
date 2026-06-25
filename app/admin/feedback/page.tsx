import Link from "next/link";
import { getRecentFeedback, getRecentDeathFeedback } from "@/lib/admin-analytics";

export const dynamic = "force-dynamic";

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("tr", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminFeedbackPage() {
  const [deaths, reports] = await Promise.all([getRecentDeathFeedback(30), getRecentFeedback(20)]);
  const deathRows = deaths.filter((d) => !d.tableMissing);
  const tableMissing = deaths.length === 1 && deaths[0].tableMissing;

  return (
    <>
      <h1 className="adm-h1">Feedback Kalite Örnekleme</h1>
      <p className="adm-sub">Kullanıcılara giden gerçek AI koç-metinleri — karta tıkla → o oyuncunun geçmişi</p>

      {/* ── PER-DEATH (the actual coaching users see every death) ── */}
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>
        Ölüm-anı feedback&apos;leri <span style={{ color: "rgba(238,240,248,0.4)", fontWeight: 400, fontSize: 13 }}>— her ölümde kullanıcının gördüğü (canlı dolar)</span>
      </h3>
      {tableMissing ? (
        <div className="adm-note" style={{ marginBottom: 26 }}>
          <b>feedback kolonu henüz yok.</b> <code>alter table public.match_events add column if not exists feedback jsonb;</code> çalıştır;
          sonraki ölümden itibaren ölüm-anı koçlukları buraya düşer.
        </div>
      ) : deathRows.length === 0 ? (
        <div className="adm-note" style={{ marginBottom: 26 }}>Henüz ölüm-anı feedback&apos;i yok — biri oynayıp ölünce buraya gelir.</div>
      ) : (
        <div className="adm-grid cols-2" style={{ marginBottom: 28 }}>
          {deathRows.map((d) => (
            <Link key={d.id} href={d.userId ? `/admin/users/${d.userId}` : "#"} className="adm-card adm-fb" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 12 }}>
                <span style={{ color: "var(--iris-cyan)", fontWeight: 600, textTransform: "capitalize" }}>
                  {d.map ?? "?"} · {d.agent ?? "?"}{d.deathLoc ? ` · ${d.deathLoc}` : ""}
                </span>
                <span style={{ color: "rgba(238,240,248,0.45)" }}>{d.userLabel} · {fmt(d.createdAt)}</span>
              </div>
              {d.deathAnalysis ? <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(238,240,248,0.88)", margin: "0 0 8px" }}>{d.deathAnalysis}</p> : null}
              {d.enemyAnalysis.map((e, i) => (
                <p key={i} style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(238,240,248,0.6)", margin: "0 0 4px" }}>• {e}</p>
              ))}
              {d.nextRoundSuggestion ? <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "#9fd0ff", margin: "8px 0 0" }}><b>Sonraki:</b> {d.nextRoundSuggestion}</p> : null}
            </Link>
          ))}
        </div>
      )}

      {/* ── POST-MATCH REPORTS (historical) ── */}
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>
        Maç-sonu raporları <span style={{ color: "rgba(238,240,248,0.4)", fontWeight: 400, fontSize: 13 }}>— maç bitince üretilen özet</span>
      </h3>
      {reports.length === 0 ? (
        <div className="adm-note">Henüz kayıtlı maç raporu yok.</div>
      ) : (
        <div className="adm-grid cols-2">
          {reports.map((f) => (
            <Link key={f.id} href={`/admin/users/${f.userId}`} className="adm-card adm-fb" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 12 }}>
                <span style={{ color: "var(--iris-violet)", fontWeight: 600, textTransform: "capitalize" }}>{f.map ?? "?"} · {f.agent ?? "?"}</span>
                <span style={{ color: "rgba(238,240,248,0.45)" }}>{f.userLabel} · {fmt(f.createdAt)}</span>
              </div>
              {f.summary ? <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(238,240,248,0.86)", margin: "0 0 10px" }}>{f.summary}</p> : null}
              {f.mistake ? <p style={{ fontSize: 13, lineHeight: 1.55, color: "#ff9aa3", margin: 0 }}><b style={{ color: "#ff8a95" }}>Hata:</b> {f.mistake}</p> : null}
              {!f.summary && !f.mistake ? <p style={{ fontSize: 13, color: "rgba(238,240,248,0.4)" }}>metin yok</p> : null}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
