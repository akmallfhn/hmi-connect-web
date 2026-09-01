import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listAllChaptersAdmin } from "@/apis/chapters";
import { getCoordinatingChapterDetail } from "@/apis/coordinating-chapters";
import { getStructuralOverview } from "@/apis/structurals";
import { listTrainings } from "@/apis/trainings";
import { listUsers } from "@/apis/users";
import CoordinatingChapterDetailPage, {
  type CoordinatingChapterDetailTab,
} from "@/components/pages/CoordinatingChapterDetailPage";

export const metadata: Metadata = {
  title: "Detail Korkom",
  robots: {
    index: false,
    follow: false,
  },
};

interface BranchCoordinatingChapterDetailPageProps {
  params: Promise<{ branch_id: string; coordinating_chapter_id: string }>;
  searchParams: Promise<{ tab?: string; period?: string }>;
}

function parseTab(tab?: string): CoordinatingChapterDetailTab {
  if (tab === "management" || tab === "chapters" || tab === "trainings") {
    return tab;
  }
  return "profile";
}

export default async function BranchCoordinatingChapterDetailPage({
  params,
  searchParams,
}: BranchCoordinatingChapterDetailPageProps) {
  const [{ branch_id, coordinating_chapter_id }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const coordinatingChapter = await getCoordinatingChapterDetail(
    coordinating_chapter_id
  );
  if (!coordinatingChapter || coordinatingChapter.branch_id !== branch_id) {
    notFound();
  }

  const [chapters, memberResult, structuralOverview] = await Promise.all([
    listAllChaptersAdmin({ coordinatingChapterId: coordinating_chapter_id }),
    listUsers({
      coordinatingChapterId: coordinating_chapter_id,
      status: "active",
      page: 1,
      pageSize: 1,
    }),
    getStructuralOverview(
      "coordinating_chapter",
      coordinating_chapter_id,
      query.period ? Number(query.period) : null
    ),
  ]);

  // A Korkom never organizes its own trainings — LK1 is organized per Komisariat, so this aggregates every chapter's own trainings/list into one feed.
  const trainingResults = await Promise.all(
    chapters.map((chapter) =>
      listTrainings({
        organizerType: "chapter",
        organizerId: chapter.id,
        page: 1,
        pageSize: 100,
      })
    )
  );
  const trainings = trainingResults
    .flatMap((result) => result.list)
    .sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );

  return (
    <CoordinatingChapterDetailPage
      coordinatingChapter={coordinatingChapter}
      chapters={chapters}
      memberCount={memberResult.totalData}
      trainings={trainings}
      structuralPeriods={structuralOverview.periods}
      selectedStructuralPeriod={structuralOverview.selectedPeriod}
      selectedStructuralPeriodId={structuralOverview.selectedPeriodId}
      initialTab={parseTab(query.tab)}
      backHref={`/branches/${branch_id}/coordinating-chapters`}
      allowStatusChange
    />
  );
}
