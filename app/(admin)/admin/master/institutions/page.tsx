import type { Metadata } from "next";
import { listInstitutionsAdmin } from "@/apis/institutions";
import AdminInstitutionListPage from "@/components/pages/AdminInstitutionListPage";
import { parseInstitutionSort } from "@/lib/institution-sort";

export const metadata: Metadata = {
  title: "Institusi Pendidikan",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 20;

export default async function MasterInstitutionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
    sort_by?: string;
    sort_type?: string;
  }>;
}) {
  const query = await searchParams;
  const search = query.search?.trim() ?? "";
  const page = Math.max(1, Number(query.page ?? "1") || 1);
  const sort = parseInstitutionSort(query);
  const result = await listInstitutionsAdmin({
    search: search || undefined,
    sortBy: sort?.by,
    sortType: sort?.type,
    includeAggregates: true,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <AdminInstitutionListPage
      institutions={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      pageSize={PAGE_SIZE}
      sort={sort}
    />
  );
}
