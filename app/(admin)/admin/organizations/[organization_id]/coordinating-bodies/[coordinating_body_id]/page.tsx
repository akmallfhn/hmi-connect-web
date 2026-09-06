import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listAllBranchesAdmin } from "@/apis/branches";
import { getCoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import { listAllAccessGrants } from "@/apis/access-grants";
import { getSession } from "@/apis/session";
import { getStructuralOverview } from "@/apis/structurals";
import { canManageEntity } from "@/lib/access";
import CoordinatingBodyDetailPage, {
  type CoordinatingBodyDetailTab,
} from "@/components/pages/CoordinatingBodyDetailPage";

export const metadata: Metadata = {
  title: "Detail Badko",
  robots: {
    index: false,
    follow: false,
  },
};

interface OrganizationCoordinatingBodyDetailPageProps {
  params: Promise<{
    organization_id: string;
    coordinating_body_id: string;
  }>;
  searchParams: Promise<{ tab?: string; period?: string }>;
}

function parseTab(tab?: string): CoordinatingBodyDetailTab {
  if (tab === "management" || tab === "branches" || tab === "access") {
    return tab;
  }
  return "profile";
}

export default async function OrganizationCoordinatingBodyDetailPage({
  params,
  searchParams,
}: OrganizationCoordinatingBodyDetailPageProps) {
  const [{ organization_id, coordinating_body_id }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const coordinatingBody =
    await getCoordinatingBodyDetail(coordinating_body_id);
  if (
    !coordinatingBody ||
    coordinatingBody.organization_id !== organization_id
  ) {
    notFound();
  }

  const [branches, structuralOverview, { user }, accessGrants] =
    await Promise.all([
      listAllBranchesAdmin({
        organizationId: organization_id,
        coordinatingBodyId: coordinating_body_id,
      }),
      getStructuralOverview(
        "coordinating_body",
        coordinating_body_id,
        query.period ? Number(query.period) : null
      ),
      getSession(),
      listAllAccessGrants("coordinating_body", coordinating_body_id),
    ]);

  return (
    <CoordinatingBodyDetailPage
      coordinatingBody={coordinatingBody}
      branches={branches}
      structuralPeriods={structuralOverview.periods}
      selectedStructuralPeriod={structuralOverview.selectedPeriod}
      selectedStructuralPeriodId={structuralOverview.selectedPeriodId}
      showTrainings={false}
      accessGrants={accessGrants}
      canInviteAccess={canManageEntity(user, "organization", organization_id)}
      accessInviteDisabled={coordinatingBody.status === "inactive"}
      initialTab={parseTab(query.tab)}
      backHref={`/organizations/${organization_id}/coordinating-bodies`}
      allowEdit={false}
    />
  );
}
