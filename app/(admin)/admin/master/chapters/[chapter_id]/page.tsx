import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChapterDetail } from "@/apis/chapters";
import { listAllAccessGrants } from "@/apis/access-grants";
import { getStructuralOverview } from "@/apis/structurals";
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

interface MasterChapterDetailPageProps {
  params: Promise<{ chapter_id: string }>;
  searchParams: Promise<{ tab?: string; period?: string }>;
}

function parseTab(tab?: string): ChapterDetailTab {
  if (tab === "management" || tab === "trainings" || tab === "access") {
    return tab;
  }
  return "profile";
}

export default async function MasterChapterDetailPage({
  params,
  searchParams,
}: MasterChapterDetailPageProps) {
  const [{ chapter_id }, query] = await Promise.all([params, searchParams]);
  const chapter = await getChapterDetail(chapter_id);
  if (!chapter) notFound();

  const [memberResult, trainingResult, structuralOverview, accessGrants] =
    await Promise.all([
      listUsers({
        chapterId: chapter_id,
        status: "active",
        page: 1,
        pageSize: 1,
      }),
      listTrainings({
        organizerType: "chapter",
        organizerId: chapter_id,
        page: 1,
        pageSize: 100,
      }),
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
      trainings={trainingResult.list}
      structuralPeriods={structuralOverview.periods}
      selectedStructuralPeriod={structuralOverview.selectedPeriod}
      selectedStructuralPeriodId={structuralOverview.selectedPeriodId}
      accessGrants={accessGrants}
      canInviteAccess
      canRevokeAccess
      initialTab={parseTab(query.tab)}
      backHref="/master/chapters"
      allowEdit
      allowStatusChange
    />
  );
}
