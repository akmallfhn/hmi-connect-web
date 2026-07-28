import type { Metadata } from "next";
import { listBranchesAdmin } from "@/apis/branches";
import AdminBranchListPage from "@/components/pages/AdminBranchListPage";
import type { StatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Cabang",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 20;

interface MasterBranchesPageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function MasterBranchesPage({
  searchParams,
}: MasterBranchesPageProps) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const status = params.status ?? "";
  const page = Number(params.page ?? "1") || 1;

  const result = await listBranchesAdmin({
    search: search || undefined,
    status: (status || undefined) as StatusEnum | undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <AdminBranchListPage
      branches={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      initialStatus={status}
      pageSize={PAGE_SIZE}
    />
  );
}
