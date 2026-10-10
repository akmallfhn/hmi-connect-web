import type { Metadata } from "next";
import { listUsers } from "@/apis/users";
import AdminMemberListPage from "@/components/pages/AdminMemberListPage";
import {
  resolveMemberFilters,
  type MemberFilterQuery,
} from "@/lib/resolve-member-filters";

export const metadata: Metadata = {
  title: "Daftar Kader Organisasi",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

interface OrganizationMembersPageProps {
  params: Promise<{ organization_id: string }>;
  searchParams: Promise<MemberFilterQuery>;
}

export default async function OrganizationMembersPage({
  params,
  searchParams,
}: OrganizationMembersPageProps) {
  const { organization_id } = await params;
  const { search, selection, sort, listOptions } = await resolveMemberFilters(
    { scope: "organization", organizationId: organization_id },
    await searchParams
  );
  const result = await listUsers({ ...listOptions, pageSize: PAGE_SIZE });

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
      selection={selection}
      sort={sort}
      pageSize={PAGE_SIZE}
    />
  );
}
