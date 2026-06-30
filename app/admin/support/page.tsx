import Link from "next/link";
import { getSupportMessages } from "@/lib/admin-analytics";
import { updateSupportStatus } from "./actions";

export const dynamic = "force-dynamic";

// 4 durum: açık → işlemde → çözüldü / reddedildi. Anahtarlar server action
// whitelist'i (actions.ts) ile BİREBİR aynı olmalı.
const STATUS_META: Record<string, { label: string; badge: string }> = {
  open: { label: "açık", badge: "muted" },
  in_progress: { label: "işlemde", badge: "warn" },
  resolved: { label: "çözüldü", badge: "ok" },
  rejected: { label: "reddedildi", badge: "bad" },
};
const ACTIONS: { key: string; label: string; cls: string }[] = [
  { key: "in_progress", label: "⏳ İşlemde", cls: "warn" },
  { key: "resolved", label: "✓ Çözüldü", cls: "ok" },
  { key: "rejected", label: "✗ Reddet", cls: "bad" },
  { key: "open", label: "↻ Aç", cls: "" },
];

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("tr", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminSupportPage() {
  const { messages, tableMissing } = await getSupportMessages(100);
  const pendingCount = messages.filter((m) => m.status === "open" || m.status === "in_progress").length;
  const resolvedCount = messages.filter((m) => m.status === "resolved").length;

  return (
    <>
      <h1 className="adm-h1">Yardım / Sorular</h1>
      <p className="adm-sub">Kullanıcıların Destek ekranından gönderdiği sorular — en yeni en üstte. Hallettiğini <b>Çözüldü</b> işaretle, sayaçlar güncellensin.</p>

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
            <div className="adm-card"><p className="adm-stat-label">BEKLEYEN</p><div className="adm-stat-num iris">{pendingCount}</div><p className="adm-stat-sub">açık + işlemde</p></div>
            <div className="adm-card"><p className="adm-stat-label">ÇÖZÜLDÜ</p><div className="adm-stat-num">{resolvedCount}</div></div>
          </div>

          <div className="adm-card" style={{ marginTop: 14, padding: 4 }}>
            <table className="adm-table">
              <thead>
                <tr><th>Tarih</th><th>Kullanıcı</th><th>E-posta</th><th>Mesaj</th><th>Durum</th><th>İşlem</th></tr>
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
                      <span className={`adm-badge ${STATUS_META[m.status]?.badge ?? "muted"}`}>
                        {STATUS_META[m.status]?.label ?? m.status}
                      </span>
                    </td>
                    <td>
                      {/* Her durum için ayrı buton (mevcut durum hariç). Server action
                          actions.ts içinde admin'i yeniden doğruluyor (bağımsız POST endpoint'i). */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {ACTIONS.filter((a) => a.key !== m.status).map((a) => (
                          <form action={updateSupportStatus} key={a.key}>
                            <input type="hidden" name="id" value={m.id} />
                            <input type="hidden" name="status" value={a.key} />
                            <button type="submit" className={`adm-act ${a.cls}`}>{a.label}</button>
                          </form>
                        ))}
                      </div>
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
