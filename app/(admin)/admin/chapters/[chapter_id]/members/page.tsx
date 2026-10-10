import type { Metadata } from "next";
import { getChapterDetail } from "@/apis/chapters";
import { listUsers } from "@/apis/users";
import AdminMemberListPage from "@/components/pages/AdminMemberListPage";
import {
  resolveMemberFilters,
  type MemberFilterQuery,
} from "@/lib/resolve-member-filters";

export const metadata: Metadata = {
  title: "Daftar Kader Komisariat",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

interface ChapterMembersPageProps {
  params: Promise<{ chapter_id: string }>;
  searchParams: Promise<MemberFilterQuery>;
}

export default async function ChapterMembersPage({
  params,
  searchParams,
}: ChapterMembersPageProps) {
  const { chapter_id } = await params;
  const query = await searchParams;
  const [chapter, filters] = await Promise.all([
    getChapterDetail(chapter_id),
    resolveMemberFilters({ scope: "chapter", chapterId: chapter_id }, query),
  ]);
  const result = await listUsers({
    ...filters.listOptions,
    pageSize: PAGE_SIZE,
  });

  return (
    <AdminMemberListPage
      basePath={`/chapters/${chapter_id}`}
      scopeName={`HMI Komisariat ${chapter?.name ?? "ini"}`}
      managementScope="chapter"
      users={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={filters.search}
      selection={filters.selection}
      sort={filters.sort}
      pageSize={PAGE_SIZE}
    />
  );
}
