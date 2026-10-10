import type { Metadata } from "next";
import { getCoordinatingChapterDetail } from "@/apis/coordinating-chapters";
import { listUsers } from "@/apis/users";
import AdminMemberListPage from "@/components/pages/AdminMemberListPage";
import {
  resolveMemberFilters,
  type MemberFilterQuery,
} from "@/lib/resolve-member-filters";

export const metadata: Metadata = {
  title: "Daftar Kader Korkom",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

interface CoordinatingChapterMembersPageProps {
  params: Promise<{ coordinating_chapter_id: string }>;
  searchParams: Promise<MemberFilterQuery>;
}

export default async function CoordinatingChapterMembersPage({
  params,
  searchParams,
}: CoordinatingChapterMembersPageProps) {
  const { coordinating_chapter_id } = await params;
  const query = await searchParams;
  const [coordinatingChapter, filters] = await Promise.all([
    getCoordinatingChapterDetail(coordinating_chapter_id),
    resolveMemberFilters(
      {
        scope: "coordinating_chapter",
        coordinatingChapterId: coordinating_chapter_id,
      },
      query
    ),
  ]);
  const result = await listUsers({
    ...filters.listOptions,
    pageSize: PAGE_SIZE,
  });

  return (
    <AdminMemberListPage
      basePath={`/coordinating-chapters/${coordinating_chapter_id}`}
      scopeName={`HMI Korkom ${coordinatingChapter?.name ?? "ini"}`}
      managementScope="coordinating_chapter"
      users={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={filters.search}
      selection={filters.selection}
      sort={filters.sort}
      filterAnchors={{ coordinatingChapterId: coordinating_chapter_id }}
      pageSize={PAGE_SIZE}
    />
  );
}
