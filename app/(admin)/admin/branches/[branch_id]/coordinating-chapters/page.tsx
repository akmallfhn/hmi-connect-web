import type { Metadata } from "next";
import { getBranchDetail } from "@/apis/branches";
import { listCoordinatingChaptersAdmin } from "@/apis/coordinating-chapters";
import AdminCoordinatingChapterListPage from "@/components/pages/AdminCoordinatingChapterListPage";
import type { StatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Kelola Korkom",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 20;

interface BranchCoordinatingChaptersPageProps {
  params: Promise<{ branch_id: string }>;
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function BranchCoordinatingChaptersPage({
  params,
  searchParams,
}: BranchCoordinatingChaptersPageProps) {
  const { branch_id } = await params;
  const query = await searchParams;
  const search = query.search?.trim() ?? "";
  const status = query.status ?? "";
  const page = Number(query.page ?? "1") || 1;

  const result = await listCoordinatingChaptersAdmin({
    branchId: branch_id,
    search: search || undefined,
    status: (status || undefined) as StatusEnum | undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  // coordinating-chapters/list already returns branch_name per row (every row here shares the same Cabang) — only fall back to a detail fetch when the list is empty and there's no row to read it from.
  const branchName =
    result.list[0]?.branch_name ?? (await getBranchDetail(branch_id))?.name ?? null;

  return (
    <AdminCoordinatingChapterListPage
      coordinatingChapters={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      initialStatus={status}
      pageSize={PAGE_SIZE}
      selectedBranch={branchName ? { id: branch_id, name: branchName } : null}
      allowEdit={false}
      allowDelete={false}
      detailBasePath={`/branches/${branch_id}/coordinating-chapters`}
      hideBranchFilter
    />
  );
}
