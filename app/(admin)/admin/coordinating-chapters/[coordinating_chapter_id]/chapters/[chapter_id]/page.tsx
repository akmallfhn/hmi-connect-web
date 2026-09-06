import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChapterDetail } from "@/apis/chapters";
import { listAllAccessGrants } from "@/apis/access-grants";
import { getStructuralOverview } from "@/apis/structurals";
import { listUsers } from "@/apis/users";
import ChapterDetailPage, {
  type ChapterDetailTab,
} from "@/components/pages/ChapterDetailPage";

export const metadata: Metadata = {
  title: "Detail Komisariat",
  robots: {
    index: false,
    follow: false,
  },
};

interface CoordinatingChapterChapterDetailPageProps {
  params: Promise<{ coordinating_chapter_id: string; chapter_id: string }>;
  searchParams: Promise<{ tab?: string; period?: string }>;
}

function parseTab(tab?: string): ChapterDetailTab {
  if (tab === "management" || tab === "access") return tab;
  return "profile";
}

export default async function CoordinatingChapterChapterDetailPage({
  params,
  searchParams,
}: CoordinatingChapterChapterDetailPageProps) {
  const [{ coordinating_chapter_id, chapter_id }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const chapter = await getChapterDetail(chapter_id);
  if (!chapter || chapter.coordinating_chapter_id !== coordinating_chapter_id) {
    notFound();
  }

  const [memberResult, structuralOverview, accessGrants] = await Promise.all([
    listUsers({ chapterId: chapter_id, status: "active", page: 1, pageSize: 1 }),
    getStructuralOverview(
      "chapter",
      chapter_id,
      query.period ? Number(query.period) : null
    ),
    listAllAccessGrants("chapter", chapter_id),
  ]);

  return (
    <ChapterDetailPage
      chapter={chapter}
      memberCount={memberResult.totalData}
      structuralPeriods={structuralOverview.periods}
      selectedStructuralPeriod={structuralOverview.selectedPeriod}
      selectedStructuralPeriodId={structuralOverview.selectedPeriodId}
      showTrainings={false}
      accessGrants={accessGrants}
      initialTab={parseTab(query.tab)}
      backHref={`/coordinating-chapters/${coordinating_chapter_id}/chapters`}
    />
  );
}
