import type { Metadata } from "next";
import { getBranchDetail } from "@/apis/branches";
import { listChaptersAdmin } from "@/apis/chapters";
import AdminChapterListPage from "@/components/pages/AdminChapterListPage";
import type { StatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Kelola Komisariat",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 20;

interface MasterChaptersPageProps {
  searchParams: Promise<{
    branch_id?: string;
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function MasterChaptersPage({
  searchParams,
}: MasterChaptersPageProps) {
  const params = await searchParams;
  const branchId = params.branch_id?.trim() ?? "";
  const search = params.search?.trim() ?? "";
  const status = params.status ?? "";
  const page = Number(params.page ?? "1") || 1;

  const [branch, result] = await Promise.all([
    branchId ? getBranchDetail(branchId) : Promise.resolve(null),
    listChaptersAdmin({
      branchId: branchId || undefined,
      search: search || undefined,
      status: (status || undefined) as StatusEnum | undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);

  return (
    <AdminChapterListPage
      chapters={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      initialStatus={status}
      pageSize={PAGE_SIZE}
      selectedBranch={branch ? { id: branch.id, name: branch.name } : null}
    />
  );
}
