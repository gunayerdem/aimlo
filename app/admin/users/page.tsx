import { getUsersList } from "@/lib/admin-data";
import { UsersTable } from "./UsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const rows = await getUsersList();
  return (
    <>
      <h1 className="adm-h1">Kullanıcılar</h1>
      <p className="adm-sub">{rows.length} kullanıcı · maç sayısına göre sıralı · satıra tıkla → detay</p>
      <UsersTable rows={rows} />
    </>
  );
}
