import { getUsersList } from "@/lib/admin-data";
import { UsersTable } from "./UsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
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
