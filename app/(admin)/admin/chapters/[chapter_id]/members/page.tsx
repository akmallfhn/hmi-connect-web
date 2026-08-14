import type { Metadata } from "next";
import { getChapterDetail } from "@/apis/chapters";
import { listUsers } from "@/apis/users";
import AdminMemberListPage from "@/components/pages/AdminMemberListPage";
import type { UserStatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Daftar Kader Komisariat",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

interface ChapterMembersPageProps {
  params: Promise<{ chapter_id: string }>;
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function ChapterMembersPage({
  params,
  searchParams,
}: ChapterMembersPageProps) {
  const { chapter_id } = await params;
  const query = await searchParams;
  const search = query.search?.trim() ?? "";
  const status = query.status ?? "";
  const page = Number(query.page ?? "1") || 1;
  const [chapter, result] = await Promise.all([
    getChapterDetail(chapter_id),
    listUsers({
      chapterId: chapter_id,
      search: search || undefined,
      status: (status || undefined) as UserStatusEnum | undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);

  return (
    <AdminMemberListPage
      basePath={`/chapters/${chapter_id}`}
      scopeName={`HMI Komisariat ${chapter?.name ?? "ini"}`}
      managementScope="chapter"
      users={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      initialStatus={status}
      pageSize={PAGE_SIZE}
    />
  );
}
