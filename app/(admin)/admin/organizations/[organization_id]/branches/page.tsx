import type { Metadata } from "next";
import { listBranchesAdmin } from "@/apis/branches";
import { getCoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import AdminBranchListPage from "@/components/pages/AdminBranchListPage";
import type { StatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Kelola Cabang",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 18;

interface OrganizationBranchesPageProps {
  params: Promise<{ organization_id: string }>;
  searchParams: Promise<{
    coordinating_body_id?: string;
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function OrganizationBranchesPage({
  params,
  searchParams,
}: OrganizationBranchesPageProps) {
  const [{ organization_id }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const coordinatingBodyId = query.coordinating_body_id?.trim() ?? "";
  const search = query.search?.trim() ?? "";
  const status = query.status ?? "";
  const page = Number(query.page ?? "1") || 1;

  const [coordinatingBody, result] = await Promise.all([
    coordinatingBodyId
      ? getCoordinatingBodyDetail(coordinatingBodyId)
      : Promise.resolve(null),
    listBranchesAdmin({
      organizationId: organization_id,
      coordinatingBodyId: coordinatingBodyId || undefined,
      search: search || undefined,
      status: (status || undefined) as StatusEnum | undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);

  return (
    <AdminBranchListPage
      branches={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      initialStatus={status}
      pageSize={PAGE_SIZE}
      selectedCoordinatingBody={
        coordinatingBody
          ? { id: coordinatingBody.id, name: coordinatingBody.name }
          : null
      }
      allowEdit={false}
      allowDelete={false}
      detailBasePath={`/organizations/${organization_id}/branches`}
    />
  );
}
