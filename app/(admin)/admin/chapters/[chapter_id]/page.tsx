import type { Metadata } from "next";
import { getChapterDetail } from "@/apis/chapters";
import {
  getChapterSummary,
  getUserGrowth,
  getVerificationCount,
} from "@/apis/stat";
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
  const [
    chapter,
    summary,
    userGrowthDay,
    userGrowthWeek,
    userGrowthMonth,
    verificationCount,
  ] = await Promise.all([
    getChapterDetail(chapter_id),
    getChapterSummary(chapter_id),
    getUserGrowth({ granularity: "day", chapterId: chapter_id }),
    getUserGrowth({ granularity: "week", chapterId: chapter_id }),
    getUserGrowth({ granularity: "month", chapterId: chapter_id }),
    getVerificationCount({ chapterId: chapter_id }),
  ]);
  return (
    <ChapterDashboardPage
      chapterName={chapter?.name ?? "ini"}
      summary={summary}
      userGrowthDay={userGrowthDay?.list ?? []}
      userGrowthWeek={userGrowthWeek?.list ?? []}
      userGrowthMonth={userGrowthMonth?.list ?? []}
      verificationCount={verificationCount}
    />
  );
}
