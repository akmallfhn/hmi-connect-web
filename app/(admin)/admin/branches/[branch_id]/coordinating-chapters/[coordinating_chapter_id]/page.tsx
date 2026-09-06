import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listAllChaptersAdmin } from "@/apis/chapters";
import { getCoordinatingChapterDetail } from "@/apis/coordinating-chapters";
import { listAllAccessGrants } from "@/apis/access-grants";
import { getStructuralOverview } from "@/apis/structurals";
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
  if (tab === "management" || tab === "chapters" || tab === "access") {
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

  const [chapters, memberResult, structuralOverview, accessGrants] =
    await Promise.all([
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
      listAllAccessGrants("coordinating_chapter", coordinating_chapter_id),
    ]);

  return (
    <CoordinatingChapterDetailPage
      coordinatingChapter={coordinatingChapter}
      chapters={chapters}
      memberCount={memberResult.totalData}
      structuralPeriods={structuralOverview.periods}
      selectedStructuralPeriod={structuralOverview.selectedPeriod}
      selectedStructuralPeriodId={structuralOverview.selectedPeriodId}
      showTrainings={false}
      accessGrants={accessGrants}
      initialTab={parseTab(query.tab)}
      backHref={`/branches/${branch_id}/coordinating-chapters`}
      allowStatusChange
    />
  );
}
