import Link from "next/link";
import { getRecentFeedback } from "@/lib/admin-analytics";

export const dynamic = "force-dynamic";

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("tr", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminFeedbackPage() {
  const items = await getRecentFeedback(30);

  return (
    <>
      <h1 className="adm-h1">Feedback Kalite Örnekleme</h1>
      <p className="adm-sub">Kullanıcılara giden gerçek AI koç-metinleri — karta tıkla → o oyuncunun tüm geçmişi & feedback'leri</p>

      {items.length === 0 ? (
        <div className="adm-note">Henüz kayıtlı maç raporu yok.</div>
      ) : (
        <div className="adm-grid cols-2">
          {items.map((f) => (
            <Link key={f.id} href={`/admin/users/${f.userId}`} className="adm-card adm-fb" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 12 }}>
                <span style={{ color: "var(--iris-violet)", fontWeight: 600, textTransform: "capitalize" }}>
                  {f.map ?? "?"} · {f.agent ?? "?"}
                </span>
                <span style={{ color: "rgba(238,240,248,0.45)" }}>{f.userLabel} · {fmt(f.createdAt)}</span>
              </div>
              {f.summary ? (
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(238,240,248,0.86)", margin: "0 0 10px" }}>{f.summary}</p>
              ) : null}
              {f.mistake ? (
                <p style={{ fontSize: 13, lineHeight: 1.55, color: "#ff9aa3", margin: 0 }}>
                  <b style={{ color: "#ff8a95" }}>Hata:</b> {f.mistake}
                </p>
              ) : null}
              {!f.summary && !f.mistake ? <p style={{ fontSize: 13, color: "rgba(238,240,248,0.4)" }}>metin yok</p> : null}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
