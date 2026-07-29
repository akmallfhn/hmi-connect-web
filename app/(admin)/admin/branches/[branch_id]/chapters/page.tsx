import type { Metadata } from "next";
import { listChaptersAdmin } from "@/apis/chapters";
import BranchChapterListPage from "@/components/pages/BranchChapterListPage";
import type { StatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Kelola Komisariat",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 20;

interface BranchChaptersPageProps {
  params: Promise<{ branch_id: string }>;
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function BranchChaptersPage({
  params,
  searchParams,
}: BranchChaptersPageProps) {
  const { branch_id } = await params;
  const query = await searchParams;
  const search = query.search?.trim() ?? "";
  const status = query.status ?? "";
  const page = Number(query.page ?? "1") || 1;

  const result = await listChaptersAdmin({
    branchId: branch_id,
    search: search || undefined,
    status: (status || undefined) as StatusEnum | undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <BranchChapterListPage
      branchId={branch_id}
      chapters={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      initialStatus={status}
      pageSize={PAGE_SIZE}
    />
  );
}
