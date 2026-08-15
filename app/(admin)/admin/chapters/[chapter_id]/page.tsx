import type { Metadata } from "next";
import { getChapterDetail } from "@/apis/chapters";
import { getChapterSummary } from "@/apis/stat";
import ChapterDashboardPage from "@/components/pages/ChapterDashboardPage";

export const metadata: Metadata = {
  title: "Dashboard Komisariat",
  robots: {
    index: false,
    follow: false,
  },
};

interface ChapterDetailPageProps {
  params: Promise<{ chapter_id: string }>;
}

export default async function ChapterDetailPage({
  params,
}: ChapterDetailPageProps) {
  const { chapter_id } = await params;
  const [chapter, summary] = await Promise.all([
    getChapterDetail(chapter_id),
    getChapterSummary(chapter_id),
  ]);
  return (
    <ChapterDashboardPage
      chapterName={chapter?.name ?? "ini"}
      summary={summary}
    />
  );
}
