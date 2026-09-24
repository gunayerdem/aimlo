import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { getUsersList } from "@/lib/admin-data";
import { UsersTable } from "./UsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  // GÜVENLİK (canlı sızıntı, 24.09.2026): layout.tsx'teki notFound() kapısı bu
  // sayfanın veri çekimini DURDURMAZ — Next 16 layout ve page segmentlerini paralel
  // render ediyor; layout 404 atsa da page'in RSC verisi yanıtta gidiyordu
  // (kimliksiz GET + "RSC: 1" başlığıyla 200). Kapı bu yüzden veri çekiminden
  // ÖNCE burada da tekrarlanır (revenue/altyapi kalıbı). scripts/test-admin-gate.ts
  // her admin page'inin ilk await'inin getAdminUser olduğunu kilitler.
  const admin = await getAdminUser();
  if (!admin) notFound();

  const rows = await getUsersList();
  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 className="adm-h1">Kullanıcılar</h1>
          <p className="adm-sub">{rows.length} kullanıcı · maç sayısına göre sıralı · satıra tıkla → detay</p>
        </div>
        <a className="adm-btn" href="/api/admin/export?type=users" style={{ marginTop: 4 }}>⬇ CSV indir</a>
      </div>
      <UsersTable rows={rows} />
    </>
  );
}
