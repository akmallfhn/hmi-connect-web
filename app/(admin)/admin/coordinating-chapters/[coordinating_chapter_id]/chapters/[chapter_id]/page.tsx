import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChapterDetail } from "@/apis/chapters";
import { listTrainings } from "@/apis/trainings";
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
  searchParams: Promise<{ tab?: string }>;
}

function parseTab(tab?: string): ChapterDetailTab {
  if (tab === "management" || tab === "trainings") return tab;
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

  const [memberResult, trainingResult] = await Promise.all([
    listUsers({ chapterId: chapter_id, status: "active", page: 1, pageSize: 1 }),
    listTrainings({
      organizerType: "chapter",
      organizerId: chapter_id,
      page: 1,
      pageSize: 100,
    }),
  ]);

  return (
    <ChapterDetailPage
      chapter={chapter}
      memberCount={memberResult.totalData}
      trainings={trainingResult.list}
      initialTab={parseTab(query.tab)}
      backHref={`/coordinating-chapters/${coordinating_chapter_id}/chapters`}
    />
  );
}
