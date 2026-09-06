import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBranchDetail } from "@/apis/branches";
import { listAllChaptersAdmin } from "@/apis/chapters";
import { listAllAccessGrants } from "@/apis/access-grants";
import { getSession } from "@/apis/session";
import { getStructuralOverview } from "@/apis/structurals";
import { canManageEntity } from "@/lib/access";
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

interface OrganizationBranchDetailPageProps {
  params: Promise<{ organization_id: string; branch_id: string }>;
  searchParams: Promise<{ tab?: string; period?: string }>;
}

function parseTab(tab?: string): BranchDetailTab {
  if (tab === "management" || tab === "chapters" || tab === "access") {
    return tab;
  }
  return "profile";
}

export default async function OrganizationBranchDetailPage({
  params,
  searchParams,
}: OrganizationBranchDetailPageProps) {
  const [{ organization_id, branch_id }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const branch = await getBranchDetail(branch_id);
  if (!branch || branch.coordinating_body?.organization_id !== organization_id) {
    notFound();
  }

  const [chapters, structuralOverview, { user }, accessGrants] =
    await Promise.all([
      listAllChaptersAdmin({ branchId: branch_id }),
      getStructuralOverview(
        "branch",
        branch_id,
        query.period ? Number(query.period) : null
      ),
      getSession(),
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
      canInviteAccess={canManageEntity(user, "organization", organization_id)}
      accessInviteDisabled={branch.status === "inactive"}
      initialTab={parseTab(query.tab)}
      backHref={`/organizations/${organization_id}/branches`}
      allowEdit={false}
    />
  );
}
