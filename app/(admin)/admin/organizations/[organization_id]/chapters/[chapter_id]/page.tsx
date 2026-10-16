import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listAllAccessGrants } from "@/apis/access-grants";
import { getBranchDetail } from "@/apis/branches";
import { getChapterDetail } from "@/apis/chapters";
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

interface OrganizationChapterDetailPageProps {
  params: Promise<{ organization_id: string; chapter_id: string }>;
  searchParams: Promise<{ tab?: string; period?: string }>;
}

function parseTab(tab?: string): ChapterDetailTab {
  if (tab === "management" || tab === "access") return tab;
  return "profile";
}

// Read-only: a Komisariat answers to its Cabang, not to the organization.
export default async function OrganizationChapterDetailPage({
  params,
  searchParams,
}: OrganizationChapterDetailPageProps) {
  const [{ organization_id, chapter_id }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const chapter = await getChapterDetail(chapter_id);
  const branch = chapter ? await getBranchDetail(chapter.branch_id) : null;
  if (!chapter || branch?.organization_id !== organization_id) {
    notFound();
  }

  const [memberResult, structuralOverview, accessGrants] = await Promise.all([
    listUsers({
      chapterId: chapter_id,
      status: "active",
      page: 1,
      pageSize: 1,
    }),
    getStructuralOverview(
      "chapter",
      chapter_id,
      query.period ? Number(query.period) : null,
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
      backHref={`/organizations/${organization_id}/chapters`}
    />
  );
}
