import type { Metadata } from "next";
import { listUsers } from "@/apis/users";
import AdminUserListPage from "@/components/pages/AdminUserListPage";
import type { UserStatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "User Management",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 20;

interface MasterUsersPageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function MasterUsersPage({
  searchParams,
}: MasterUsersPageProps) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const status = params.status ?? "";
  const page = Number(params.page ?? "1") || 1;

  const result = await listUsers({
    search: search || undefined,
    status: (status || undefined) as UserStatusEnum | undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <AdminUserListPage
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
