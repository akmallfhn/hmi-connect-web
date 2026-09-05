import type { Metadata } from "next";
import { listAllAccessGrants } from "@/apis/access-grants";
import { listUsers } from "@/apis/users";
import AdminMemberListPage from "@/components/pages/AdminMemberListPage";
import type { UserStatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Daftar Kader Organisasi",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

interface OrganizationMembersPageProps {
  params: Promise<{ organization_id: string }>;
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function OrganizationMembersPage({
  params,
  searchParams,
}: OrganizationMembersPageProps) {
  const { organization_id } = await params;
  const query = await searchParams;
  const search = query.search?.trim() ?? "";
  const status = query.status ?? "";
  const page = Number(query.page ?? "1") || 1;
  const result = await listUsers({
    search: search || undefined,
    status: (status || undefined) as UserStatusEnum | undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const accessGrants = await listAllAccessGrants("organization", organization_id);

  return (
    <AdminMemberListPage
      basePath={`/organizations/${organization_id}`}
      scopeName="Pengurus Besar HMI"
      managementScope="organization"
      users={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      initialStatus={status}
      pageSize={PAGE_SIZE}
      adminUserIds={accessGrants
        .filter((grant) => grant.status === "accepted")
        .map((grant) => grant.user_id)}
    />
  );
}
