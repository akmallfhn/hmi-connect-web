import type { Metadata } from "next";
import { listUsers } from "@/apis/users";
import AdminUserListPage from "@/components/pages/AdminUserListPage";
import {
  resolveMemberFilters,
  type MemberFilterQuery,
} from "@/lib/resolve-member-filters";

export const metadata: Metadata = {
  title: "User Management",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 20;

interface MasterUsersPageProps {
  searchParams: Promise<MemberFilterQuery>;
}

export default async function MasterUsersPage({
  searchParams,
}: MasterUsersPageProps) {
  const { search, selection, sort, listOptions } = await resolveMemberFilters(
    { scope: "master" },
    await searchParams
  );
  const result = await listUsers({ ...listOptions, pageSize: PAGE_SIZE });

  return (
    <AdminUserListPage
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
