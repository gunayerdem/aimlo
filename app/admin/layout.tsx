import "./admin.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { AdminNav } from "./AdminNav";

// noindex — the admin surface must never be crawled. The real gate is below.
export const metadata: Metadata = {
  title: "AIMLO Admin",
  robots: { index: false, follow: false },
};

// Server-side gate for EVERY /admin/* route. getAdminUser() validates the JWT
// (getUser) AND checks public.admins via service-role. notFound() (not 403) so a
// non-admin can't even confirm the surface exists.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) notFound();

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="adm-brand">
          <span aria-hidden>▲</span> <b>AIMLO</b>&nbsp;Admin
        </div>
        <div className="adm-brand-sub">Founder Console</div>
        <AdminNav />
        <div className="adm-side-foot">{admin.email}</div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
