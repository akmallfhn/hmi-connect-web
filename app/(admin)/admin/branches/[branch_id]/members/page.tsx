import type { Metadata } from "next";
import { listUsers } from "@/apis/users";
import BranchMemberListPage from "@/components/pages/BranchMemberListPage";
import type { UserStatusEnum } from "@/lib/types";

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
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function BranchMembersPage({
  params,
  searchParams,
}: BranchMembersPageProps) {
  const { branch_id } = await params;
  const query = await searchParams;
  const search = query.search?.trim() ?? "";
  const status = query.status ?? "";
  const page = Number(query.page ?? "1") || 1;

  const result = await listUsers({
    branchId: branch_id,
    search: search || undefined,
    status: (status || undefined) as UserStatusEnum | undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <BranchMemberListPage
      branchId={branch_id}
      users={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      initialStatus={status}
      pageSize={PAGE_SIZE}
    />
  );
}
