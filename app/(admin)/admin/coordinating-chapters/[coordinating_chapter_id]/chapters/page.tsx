import type { Metadata } from "next";
import { listChaptersAdmin } from "@/apis/chapters";
import AdminChapterListPage from "@/components/pages/AdminChapterListPage";
import type { StatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Daftar Komisariat",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 20;

interface CoordinatingChapterChaptersPageProps {
  params: Promise<{ coordinating_chapter_id: string }>;
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function CoordinatingChapterChaptersPage({
  params,
  searchParams,
}: CoordinatingChapterChaptersPageProps) {
  const [{ coordinating_chapter_id }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const search = query.search?.trim() ?? "";
  const status = query.status ?? "";
  const page = Number(query.page ?? "1") || 1;

  const result = await listChaptersAdmin({
    coordinatingChapterId: coordinating_chapter_id,
    search: search || undefined,
    status: (status || undefined) as StatusEnum | undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <AdminChapterListPage
      chapters={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      initialStatus={status}
      pageSize={PAGE_SIZE}
      selectedBranch={null}
      allowCreate={false}
      allowEdit={false}
      allowDelete={false}
      detailBasePath={`/coordinating-chapters/${coordinating_chapter_id}/chapters`}
      hideBranchFilter
    />
  );
}
