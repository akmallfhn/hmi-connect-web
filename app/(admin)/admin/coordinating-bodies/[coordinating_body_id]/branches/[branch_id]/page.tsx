import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBranchDetail } from "@/apis/branches";
import { listAllChaptersAdmin } from "@/apis/chapters";
import { listAllAccessGrants } from "@/apis/access-grants";
import { getStructuralOverview } from "@/apis/structurals";
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

interface CoordinatingBodyBranchDetailPageProps {
  params: Promise<{ coordinating_body_id: string; branch_id: string }>;
  searchParams: Promise<{ tab?: string; period?: string }>;
}

function parseTab(tab?: string): BranchDetailTab {
  if (tab === "management" || tab === "chapters" || tab === "access") {
    return tab;
  }
  return "profile";
}

export default async function CoordinatingBodyBranchDetailPage({
  params,
  searchParams,
}: CoordinatingBodyBranchDetailPageProps) {
  const [{ coordinating_body_id, branch_id }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const branch = await getBranchDetail(branch_id);
  if (!branch || branch.coordinating_body_id !== coordinating_body_id) {
    notFound();
  }

  const [chapters, structuralOverview, accessGrants] = await Promise.all([
    listAllChaptersAdmin({ branchId: branch_id }),
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
      structuralPeriods={structuralOverview.periods}
      selectedStructuralPeriod={structuralOverview.selectedPeriod}
      selectedStructuralPeriodId={structuralOverview.selectedPeriodId}
      showTrainings={false}
      accessGrants={accessGrants}
      initialTab={parseTab(query.tab)}
      backHref={`/coordinating-bodies/${coordinating_body_id}/branches`}
      allowEdit={false}
      allowStatusChange={false}
    />
  );
}
