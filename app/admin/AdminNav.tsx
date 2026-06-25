"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Genel Bakış", ic: "◎" },
  { href: "/admin/live", label: "Canlı", ic: "◉" },
  { href: "/admin/users", label: "Kullanıcılar", ic: "◢" },
  { href: "/admin/insights", label: "İçgörüler", ic: "◈" },
  { href: "/admin/growth", label: "Büyüme", ic: "↗" },
  { href: "/admin/cost", label: "Maliyet", ic: "$" },
  { href: "/admin/feedback", label: "Feedback", ic: "✦" },
  { href: "/admin/revenue", label: "Gelir", ic: "₺" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="adm-nav">
      {ITEMS.map((it) => {
        const active = it.href === "/admin" ? path === "/admin" : path.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href} className={active ? "active" : ""}>
            <span className="ic" aria-hidden>{it.ic}</span>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
