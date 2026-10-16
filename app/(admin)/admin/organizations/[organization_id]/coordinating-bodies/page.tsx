import type { Metadata } from "next";
import { listCoordinatingBodiesAdmin } from "@/apis/coordinating-bodies";
import AdminCoordinatingBodyListPage from "@/components/pages/AdminCoordinatingBodyListPage";
import { parseCoordinatingBodySort } from "@/lib/coordinating-body-sort";
import type { StatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Kelola Badko",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 18;

interface OrganizationCoordinatingBodiesPageProps {
  params: Promise<{ organization_id: string }>;
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
    sort_by?: string;
    sort_type?: string;
  }>;
}

export default async function OrganizationCoordinatingBodiesPage({
  params,
  searchParams,
}: OrganizationCoordinatingBodiesPageProps) {
  const [{ organization_id }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const search = query.search?.trim() ?? "";
  const status = query.status ?? "";
  const page = Number(query.page ?? "1") || 1;
  const sort = parseCoordinatingBodySort(query);

  const result = await listCoordinatingBodiesAdmin({
    organizationId: organization_id,
    search: search || undefined,
    status: (status || undefined) as StatusEnum | undefined,
    sortBy: sort?.by,
    sortType: sort?.type,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <AdminCoordinatingBodyListPage
      coordinatingBodies={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      initialStatus={status}
      pageSize={PAGE_SIZE}
      sort={sort}
      allowDelete={false}
      detailBasePath={`/organizations/${organization_id}/coordinating-bodies`}
    />
  );
}
