import type { Metadata } from "next";
import { getCoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import { listUsers } from "@/apis/users";
import AdminMemberListPage from "@/components/pages/AdminMemberListPage";
import {
  resolveMemberFilters,
  type MemberFilterQuery,
} from "@/lib/resolve-member-filters";

export const metadata: Metadata = {
  title: "Daftar Kader Badko",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

interface CoordinatingBodyMembersPageProps {
  params: Promise<{ coordinating_body_id: string }>;
  searchParams: Promise<MemberFilterQuery>;
}

export default async function CoordinatingBodyMembersPage({
  params,
  searchParams,
}: CoordinatingBodyMembersPageProps) {
  const { coordinating_body_id } = await params;
  const query = await searchParams;
  const [coordinatingBody, filters] = await Promise.all([
    getCoordinatingBodyDetail(coordinating_body_id),
    resolveMemberFilters(
      { scope: "coordinating_body", coordinatingBodyId: coordinating_body_id },
      query
    ),
  ]);
  const result = await listUsers({
    ...filters.listOptions,
    pageSize: PAGE_SIZE,
  });

  return (
    <AdminMemberListPage
      basePath={`/coordinating-bodies/${coordinating_body_id}`}
      scopeName={`HMI Badko ${coordinatingBody?.name ?? "ini"}`}
      managementScope="coordinating_body"
      users={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={filters.search}
      selection={filters.selection}
      sort={filters.sort}
      filterAnchors={{ coordinatingBodyId: coordinating_body_id }}
      pageSize={PAGE_SIZE}
    />
  );
}
