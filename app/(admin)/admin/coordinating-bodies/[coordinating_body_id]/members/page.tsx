import type { Metadata } from "next";
import { getCoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import { listAllAccessGrants } from "@/apis/access-grants";
import { listUsers } from "@/apis/users";
import AdminMemberListPage from "@/components/pages/AdminMemberListPage";
import type { UserStatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Daftar Kader Badko",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

interface CoordinatingBodyMembersPageProps {
  params: Promise<{ coordinating_body_id: string }>;
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function CoordinatingBodyMembersPage({
  params,
  searchParams,
}: CoordinatingBodyMembersPageProps) {
  const { coordinating_body_id } = await params;
  const query = await searchParams;
  const search = query.search?.trim() ?? "";
  const status = query.status ?? "";
  const page = Number(query.page ?? "1") || 1;
  const [coordinatingBody, result] = await Promise.all([
    getCoordinatingBodyDetail(coordinating_body_id),
    listUsers({
      coordinatingBodyId: coordinating_body_id,
      search: search || undefined,
      status: (status || undefined) as UserStatusEnum | undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);

  const accessGrants = await listAllAccessGrants("coordinating_body", coordinating_body_id);

  return (
    <AdminMemberListPage
      basePath={`/coordinating-bodies/${coordinating_body_id}`}
      scopeName={`HMI Badko ${coordinatingBody?.name ?? "ini"}`}
      managementScope="coordinating_body"
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
