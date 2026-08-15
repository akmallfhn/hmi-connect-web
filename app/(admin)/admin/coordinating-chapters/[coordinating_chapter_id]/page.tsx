import type { Metadata } from "next";
import { getCoordinatingChapterDetail } from "@/apis/coordinating-chapters";
import {
  getChapterDistribution,
  getCoordinatingChapterSummary,
} from "@/apis/stat";
import CoordinatingChapterDashboardPage from "@/components/pages/CoordinatingChapterDashboardPage";

export const metadata: Metadata = {
  title: "Dashboard Korkom",
  robots: {
    index: false,
    follow: false,
  },
};

interface CoordinatingChapterDetailPageProps {
  params: Promise<{ coordinating_chapter_id: string }>;
}

export default async function CoordinatingChapterDetailPage({
  params,
}: CoordinatingChapterDetailPageProps) {
  const { coordinating_chapter_id } = await params;
  const [coordinatingChapter, summary, chapterDistribution] = await Promise.all([
    getCoordinatingChapterDetail(coordinating_chapter_id),
    getCoordinatingChapterSummary(coordinating_chapter_id),
    getChapterDistribution({
      coordinatingChapterId: coordinating_chapter_id,
    }),
  ]);
  return (
    <CoordinatingChapterDashboardPage
      coordinatingChapterName={coordinatingChapter?.name ?? "ini"}
      summary={summary}
      chapterDistribution={chapterDistribution}
    />
  );
}
