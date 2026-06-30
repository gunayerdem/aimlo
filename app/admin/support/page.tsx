import Link from "next/link";
import { getSupportMessages } from "@/lib/admin-analytics";

export const dynamic = "force-dynamic";

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("tr", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminSupportPage() {
  const { messages, tableMissing } = await getSupportMessages(100);
  const openCount = messages.filter((m) => m.status === "open").length;

  return (
    <>
      <h1 className="adm-h1">Yardım / Sorular</h1>
      <p className="adm-sub">Kullanıcıların Destek ekranından gönderdiği sorular — en yeni en üstte</p>

      {tableMissing ? (
        <div className="adm-note">
          <b>support_messages tablosu henüz yok.</b> <code>supabase/0010_support_messages.sql</code> migration&apos;ını
          Supabase SQL Editor&apos;de çalıştır; ardından gelen destek mesajları buraya düşer.
        </div>
      ) : messages.length === 0 ? (
        <div className="adm-note">Henüz destek mesajı yok — biri Destek ekranından soru gönderince burada görünür.</div>
      ) : (
        <>
          <div className="adm-grid cols-3">
            <div className="adm-card"><p className="adm-stat-label">TOPLAM</p><div className="adm-stat-num">{messages.length}</div></div>
            <div className="adm-card"><p className="adm-stat-label">AÇIK</p><div className="adm-stat-num iris">{openCount}</div><p className="adm-stat-sub">henüz çözülmedi</p></div>
            <div className="adm-card"><p className="adm-stat-label">ÇÖZÜLDÜ</p><div className="adm-stat-num">{messages.length - openCount}</div></div>
          </div>

          <div className="adm-card" style={{ marginTop: 14, padding: 4 }}>
            <table className="adm-table">
              <thead>
                <tr><th>Tarih</th><th>Kullanıcı</th><th>E-posta</th><th>Mesaj</th><th>Durum</th></tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id}>
                    <td style={{ color: "rgba(238,240,248,0.55)", whiteSpace: "nowrap" }}>{fmt(m.createdAt)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {m.userId ? <Link href={`/admin/users/${m.userId}`}>{m.userLabel}</Link> : m.userLabel}
                    </td>
                    <td style={{ color: "rgba(238,240,248,0.6)", whiteSpace: "nowrap" }}>{m.email ?? "—"}</td>
                    {/* React escapes m.message by default — no dangerouslySetInnerHTML. */}
                    <td style={{ whiteSpace: "pre-wrap", lineHeight: 1.55, maxWidth: 560 }}>{m.message}</td>
                    <td>
                      <span className={`adm-badge ${m.status === "open" ? "muted" : "ok"}`}>
                        {m.status === "open" ? "açık" : m.status === "resolved" ? "çözüldü" : m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
