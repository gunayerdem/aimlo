import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserDetail } from "@/lib/admin-data";
import { getAdminUser, logAdminAudit } from "@/lib/admin-auth";
import { formatUsd } from "@/lib/openai-pricing";

export const dynamic = "force-dynamic";

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("tr", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function asNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const [detail, admin] = await Promise.all([getUserDetail(userId), getAdminUser()]);
  if (!detail) notFound();
  if (admin) void logAdminAudit(admin.id, "view_user_detail", userId);

  const mem = detail.memory ?? {};
  const totalMatches = asNum(mem.totalMatches);
  const winRate = asNum(mem.overallWinRate) ?? asNum(mem.winRate);
  const tendencies = Array.isArray(mem.tendencies) ? (mem.tendencies as unknown[]).slice(0, 6) : [];

  return (
    <>
      <Link href="/admin/users" className="adm-link">← Kullanıcılar</Link>
      <h1 className="adm-h1" style={{ marginTop: 10 }}>
        {detail.username ?? detail.displayName ?? detail.userId.slice(0, 8)}
      </h1>
      <p className="adm-sub">{detail.email ?? "email yok"} · {detail.userId}</p>

      <div className="adm-grid cols-4">
        <div className="adm-card"><p className="adm-stat-label">TOPLAM MAÇ</p><div className="adm-stat-num iris">{detail.matches.length}</div></div>
        <div className="adm-card"><p className="adm-stat-label">WIN RATE</p><div className="adm-stat-num">{winRate != null ? `${Math.round(winRate)}%` : "—"}</div>{totalMatches != null ? <p className="adm-stat-sub">{totalMatches} maç (profil)</p> : null}</div>
        <div className="adm-card"><p className="adm-stat-label">AI MALİYETİ</p><div className="adm-stat-num">{formatUsd(detail.cost)}</div><p className="adm-stat-sub">bu kullanıcı için</p></div>
        <div className="adm-card"><p className="adm-stat-label">SON GİRİŞ</p><div className="adm-stat-num" style={{ fontSize: 18 }}>{fmt(detail.lastSignIn)}</div><p className="adm-stat-sub">kayıt: {fmt(detail.createdAt)}</p></div>
      </div>

      {tendencies.length > 0 ? (
        <div className="adm-card" style={{ marginTop: 14 }}>
          <h3>Cross-match eğilimler (player_memory)</h3>
          <div className="adm-chip-row">
            {tendencies.map((t, i) => <span key={i} className="adm-chip">{String(t)}</span>)}
          </div>
        </div>
      ) : null}

      <div className="adm-card" style={{ marginTop: 14, padding: 4 }}>
        <table className="adm-table">
          <thead>
            <tr><th>Tarih</th><th>Harita</th><th>Ajan</th><th>Taraf</th><th>Skor</th><th>Sonuç</th></tr>
          </thead>
          <tbody>
            {detail.matches.length === 0 ? (
              <tr><td colSpan={6} style={{ color: "rgba(238,240,248,0.4)", padding: 18 }}>Kayıtlı maç yok.</td></tr>
            ) : (
              detail.matches.map((m) => (
                <tr key={m.id}>
                  <td style={{ color: "rgba(238,240,248,0.6)" }}>{fmt(m.createdAt)}</td>
                  <td style={{ textTransform: "capitalize" }}>{m.map ?? "—"}</td>
                  <td style={{ textTransform: "capitalize" }}>{m.agent ?? "—"}</td>
                  <td style={{ textTransform: "capitalize", color: "rgba(238,240,248,0.6)" }}>{m.side ?? "—"}</td>
                  <td className="adm-num">{m.score ?? "—"}</td>
                  <td>
                    {m.won === true ? <span className="adm-badge win">galibiyet</span>
                      : m.won === false ? <span className="adm-badge loss">mağlubiyet</span>
                      : <span className="adm-badge muted">—</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {detail.matches.some((m) => m.summary || m.mistake) ? (
        <div style={{ marginTop: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>
            Feedback&apos;ler <span style={{ color: "rgba(238,240,248,0.4)", fontWeight: 400, fontSize: 13 }}>— bu oyuncuya giden gerçek koç-metinleri</span>
          </h3>
          <div className="adm-grid cols-2">
            {detail.matches.filter((m) => m.summary || m.mistake).slice(0, 24).map((m) => (
              <div key={m.id} className="adm-card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 12 }}>
                  <span style={{ color: "var(--iris-violet)", fontWeight: 600, textTransform: "capitalize" }}>{m.map ?? "?"} · {m.agent ?? "?"}</span>
                  <span style={{ color: "rgba(238,240,248,0.45)" }}>{fmt(m.createdAt)}</span>
                </div>
                {m.summary ? <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(238,240,248,0.86)", margin: "0 0 10px" }}>{m.summary}</p> : null}
                {m.mistake ? <p style={{ fontSize: 13, lineHeight: 1.55, color: "#ff9aa3", margin: 0 }}><b style={{ color: "#ff8a95" }}>Hata:</b> {m.mistake}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
