import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listAllAccessGrants } from "@/apis/access-grants";
import { getBranchDetail } from "@/apis/branches";
import { listAllChaptersAdmin } from "@/apis/chapters";
import { getCoordinatingChapterDetail } from "@/apis/coordinating-chapters";
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

interface OrganizationCoordinatingChapterDetailPageProps {
  params: Promise<{ organization_id: string; coordinating_chapter_id: string }>;
  searchParams: Promise<{ tab?: string; period?: string }>;
}

function parseTab(tab?: string): CoordinatingChapterDetailTab {
  if (tab === "management" || tab === "chapters" || tab === "access") {
    return tab;
  }
  return "profile";
}

// The organization may edit a Korkom, but suspending it or regrouping its Komisariat stays with its Cabang.
export default async function OrganizationCoordinatingChapterDetailPage({
  params,
  searchParams,
}: OrganizationCoordinatingChapterDetailPageProps) {
  const [{ organization_id, coordinating_chapter_id }, query] =
    await Promise.all([params, searchParams]);
  const coordinatingChapter = await getCoordinatingChapterDetail(
    coordinating_chapter_id,
  );
  const branch = coordinatingChapter
    ? await getBranchDetail(coordinatingChapter.branch_id)
    : null;
  if (!coordinatingChapter || branch?.organization_id !== organization_id) {
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
        query.period ? Number(query.period) : null,
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
      allowEdit
      showTrainings={false}
      accessGrants={accessGrants}
      initialTab={parseTab(query.tab)}
      backHref={`/organizations/${organization_id}/coordinating-chapters`}
    />
  );
}
