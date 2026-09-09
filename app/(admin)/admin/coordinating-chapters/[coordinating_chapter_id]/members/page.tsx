import type { Metadata } from "next";
import { getCoordinatingChapterDetail } from "@/apis/coordinating-chapters";
import { getChapterDetail } from "@/apis/chapters";
import { listUsers } from "@/apis/users";
import AdminMemberListPage from "@/components/pages/AdminMemberListPage";
import type { UserStatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Daftar Kader Korkom",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

interface CoordinatingChapterMembersPageProps {
  params: Promise<{ coordinating_chapter_id: string }>;
  searchParams: Promise<{
    search?: string;
    status?: string;
    chapter_id?: string;
    page?: string;
  }>;
}

export default async function CoordinatingChapterMembersPage({
  params,
  searchParams,
}: CoordinatingChapterMembersPageProps) {
  const { coordinating_chapter_id } = await params;
  const query = await searchParams;
  const search = query.search?.trim() ?? "";
  const status = query.status ?? "";
  const chapterId = query.chapter_id?.trim() ?? "";
  const page = Number(query.page ?? "1") || 1;
  const [coordinatingChapter, result, chapter] = await Promise.all([
    getCoordinatingChapterDetail(coordinating_chapter_id),
    listUsers({
      // users/list takes at most one hierarchy id, so the Komisariat filter replaces the Korkom scope.
      ...(chapterId
        ? { chapterId }
        : { coordinatingChapterId: coordinating_chapter_id }),
      search: search || undefined,
      status: (status || undefined) as UserStatusEnum | undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    chapterId ? getChapterDetail(chapterId) : null,
  ]);


  return (
    <AdminMemberListPage
      basePath={`/coordinating-chapters/${coordinating_chapter_id}`}
      scopeName={`HMI Korkom ${coordinatingChapter?.name ?? "ini"}`}
      managementScope="coordinating_chapter"
      users={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      initialStatus={status}
      pageSize={PAGE_SIZE}
      chapterFilter={{
        selected: chapter ? { id: chapter.id, name: chapter.name } : null,
        searchParams: { coordinating_chapter_id },
      }}
    />
  );
}
