import Link from "next/link";
import { getRecentFeedback } from "@/lib/admin-analytics";

export const dynamic = "force-dynamic";

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("tr", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminFeedbackPage() {
  const items = await getRecentFeedback(25);

  return (
    <>
      <h1 className="adm-h1">Feedback Kalite Örnekleme</h1>
      <p className="adm-sub">Son üretilen AI koç-metinleri — coach-voice / uydurma / kalite gözle denetimi</p>

      {items.length === 0 ? (
        <div className="adm-note">Henüz kayıtlı maç raporu yok.</div>
      ) : (
        <div className="adm-grid cols-2">
          {items.map((f) => (
            <div key={f.id} className="adm-card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 12 }}>
                <Link href={`/admin/users/${f.id}`} className="adm-link" style={{ pointerEvents: "none", opacity: 0.9 }}>
                  <span style={{ textTransform: "capitalize" }}>{f.map ?? "?"}</span> · <span style={{ textTransform: "capitalize" }}>{f.agent ?? "?"}</span>
                </Link>
                <span style={{ color: "rgba(238,240,248,0.45)" }}>{f.userLabel} · {fmt(f.createdAt)}</span>
              </div>
              {f.summary ? (
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(238,240,248,0.85)", margin: "0 0 10px" }}>{f.summary}</p>
              ) : null}
              {f.mistake ? (
                <p style={{ fontSize: 13, lineHeight: 1.55, color: "#ff9aa3", margin: 0 }}>
                  <b style={{ color: "#ff8a95" }}>Hata:</b> {f.mistake}
                </p>
              ) : null}
              {!f.summary && !f.mistake ? <p style={{ fontSize: 13, color: "rgba(238,240,248,0.4)" }}>metin yok</p> : null}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
