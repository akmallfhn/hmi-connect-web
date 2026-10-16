import type { Metadata } from "next";
import { listBranchesAdmin } from "@/apis/branches";
import { getCoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import AdminBranchListPage from "@/components/pages/AdminBranchListPage";
import type { StatusEnum } from "@/lib/types";
import {
  NO_COORDINATING_BODY_FILTER,
  NO_COORDINATING_BODY_LABEL,
} from "@/lib/constants";

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

  const withoutCoordinatingBody =
    coordinatingBodyId === NO_COORDINATING_BODY_FILTER;

  const [coordinatingBody, result] = await Promise.all([
    coordinatingBodyId && !withoutCoordinatingBody
      ? getCoordinatingBodyDetail(coordinatingBodyId)
      : Promise.resolve(null),
    listBranchesAdmin({
      organizationId: organization_id,
      coordinatingBodyId:
        withoutCoordinatingBody ? undefined : coordinatingBodyId || undefined,
      withoutCoordinatingBody,
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
        withoutCoordinatingBody
          ? { id: NO_COORDINATING_BODY_FILTER, name: NO_COORDINATING_BODY_LABEL }
          : coordinatingBody
            ? { id: coordinatingBody.id, name: coordinatingBody.name }
            : null
      }
      allowDelete={false}
      organizationId={organization_id}
      detailBasePath={`/organizations/${organization_id}/branches`}
    />
  );
}
