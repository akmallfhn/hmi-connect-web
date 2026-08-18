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

interface CoordinatingBodyBranchesPageProps {
  params: Promise<{ coordinating_body_id: string }>;
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function CoordinatingBodyBranchesPage({
  params,
  searchParams,
}: CoordinatingBodyBranchesPageProps) {
  const [{ coordinating_body_id }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const search = query.search?.trim() ?? "";
  const status = query.status ?? "";
  const page = Number(query.page ?? "1") || 1;

  const result = await listBranchesAdmin({
    coordinatingBodyId: coordinating_body_id,
    search: search || undefined,
    status: (status || undefined) as StatusEnum | undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  // branches/list already returns coordinating_body_name per row (every row here shares the same Badko) — only fall back to a detail fetch when the list is empty and there's no row to read it from.
  const coordinatingBodyName =
    result.list[0]?.coordinating_body_name ??
    (await getCoordinatingBodyDetail(coordinating_body_id))?.name ??
    null;

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
        coordinatingBodyName
          ? { id: coordinating_body_id, name: coordinatingBodyName }
          : null
      }
      allowDelete={false}
      detailBasePath={`/coordinating-bodies/${coordinating_body_id}/branches`}
      hideCoordinatingBodyFilter
    />
  );
}
