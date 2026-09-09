import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBranchDetail } from "@/apis/branches";
import { listAllChaptersAdmin } from "@/apis/chapters";
import { listAllAccessGrants } from "@/apis/access-grants";
import { getStructuralOverview } from "@/apis/structurals";
import { listTrainings } from "@/apis/trainings";
import BranchDetailPage, {
  type BranchDetailTab,
} from "@/components/pages/BranchDetailPage";

export const metadata: Metadata = {
  title: "Detail Cabang",
  robots: {
    index: false,
    follow: false,
  },
};

interface MasterBranchDetailPageProps {
  params: Promise<{ branch_id: string }>;
  searchParams: Promise<{ tab?: string; period?: string }>;
}

function parseTab(tab?: string): BranchDetailTab {
  if (
    tab === "management" ||
    tab === "chapters" ||
    tab === "trainings" ||
    tab === "access"
  ) {
    return tab;
  }
  return "profile";
}

export default async function MasterBranchDetailPage({
  params,
  searchParams,
}: MasterBranchDetailPageProps) {
  const [{ branch_id }, query] = await Promise.all([params, searchParams]);
  const branch = await getBranchDetail(branch_id);
  if (!branch) notFound();

  const [chapters, trainingResult, structuralOverview, accessGrants] =
    await Promise.all([
      listAllChaptersAdmin({ branchId: branch_id }),
      listTrainings({
        organizerType: "branch",
        organizerId: branch_id,
        page: 1,
        pageSize: 100,
      }),
      getStructuralOverview(
        "branch",
        branch_id,
        query.period ? Number(query.period) : null
      ),
      listAllAccessGrants("branch", branch_id),
    ]);

  return (
    <BranchDetailPage
      branch={branch}
      chapters={chapters}
      trainings={trainingResult.list}
      structuralPeriods={structuralOverview.periods}
      selectedStructuralPeriod={structuralOverview.selectedPeriod}
      selectedStructuralPeriodId={structuralOverview.selectedPeriodId}
      accessGrants={accessGrants}
      canInviteAccess
      canRevokeAccess
      initialTab={parseTab(query.tab)}
      backHref="/master/branches"
      allowTypeChange
    />
  );
}
