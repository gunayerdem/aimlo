"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AdminUserRow } from "@/lib/admin-data";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr", { day: "2-digit", month: "short", year: "2-digit" });
}
function rel(iso: string | null): string {
  if (!iso) return "—";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${Math.max(0, m)} dk`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa`;
  return `${Math.floor(h / 24)} gün`;
}

export function UsersTable({ rows }: { rows: AdminUserRow[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        (r.username ?? "").toLowerCase().includes(s) ||
        (r.email ?? "").toLowerCase().includes(s) ||
        (r.displayName ?? "").toLowerCase().includes(s),
    );
  }, [q, rows]);

  return (
    <>
      <input
        className="adm-input"
        placeholder="Ara: kullanıcı adı / email / isim…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="adm-card" style={{ padding: 4 }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>Email</th>
              <th className="adm-num">Maç</th>
              <th className="adm-num">Win%</th>
              <th>Son maç</th>
              <th>Son giriş</th>
              <th>Kayıt</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ color: "rgba(238,240,248,0.4)", padding: 18 }}>Sonuç yok.</td></tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.userId}>
                  <td>
                    <Link href={`/admin/users/${r.userId}`}>
                      {r.username ?? r.displayName ?? r.userId.slice(0, 8)}
                    </Link>
                  </td>
                  <td style={{ color: "rgba(238,240,248,0.6)" }}>{r.email ?? "—"}</td>
                  <td className="adm-num"><b>{r.matches}</b></td>
                  <td className="adm-num">{r.winRate != null ? `${Math.round(r.winRate)}%` : "—"}</td>
                  <td style={{ color: "rgba(238,240,248,0.55)" }}>{rel(r.lastMatch)}</td>
                  <td style={{ color: "rgba(238,240,248,0.55)" }}>{rel(r.lastSignIn)}</td>
                  <td style={{ color: "rgba(238,240,248,0.55)" }}>{fmtDate(r.createdAt)}</td>
                  <td>
                    {r.emailConfirmed
                      ? <span className="adm-badge ok">onaylı</span>
                      : <span className="adm-badge muted">beklemede</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
