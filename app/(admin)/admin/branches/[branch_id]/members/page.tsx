import type { Metadata } from "next";
import { listUsers } from "@/apis/users";
import BranchMemberListPage from "@/components/pages/BranchMemberListPage";
import {
  resolveMemberFilters,
  type MemberFilterQuery,
} from "@/lib/resolve-member-filters";

export const metadata: Metadata = {
  title: "Daftar Kader",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 20;

interface BranchMembersPageProps {
  params: Promise<{ branch_id: string }>;
  searchParams: Promise<MemberFilterQuery>;
}

export default async function BranchMembersPage({
  params,
  searchParams,
}: BranchMembersPageProps) {
  const { branch_id } = await params;
  const { search, selection, sort, listOptions } = await resolveMemberFilters(
    { scope: "branch", branchId: branch_id },
    await searchParams
  );
  const result = await listUsers({ ...listOptions, pageSize: PAGE_SIZE });

  return (
    <BranchMemberListPage
      branchId={branch_id}
      users={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      selection={selection}
      sort={sort}
      filterAnchors={{ branchId: branch_id }}
      pageSize={PAGE_SIZE}
    />
  );
}
