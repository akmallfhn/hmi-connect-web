import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listAllBranchesAdmin } from "@/apis/branches";
import { getCoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import { getStructuralOverview } from "@/apis/structurals";
import { listTrainings } from "@/apis/trainings";
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
  if (tab === "management" || tab === "branches" || tab === "trainings") {
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

  const [branches, trainingResult, structuralOverview] = await Promise.all([
    listAllBranchesAdmin({
      organizationId: organization_id,
      coordinatingBodyId: coordinating_body_id,
    }),
    listTrainings({
      organizerType: "coordinating_body",
      organizerId: coordinating_body_id,
      page: 1,
      pageSize: 100,
    }),
    getStructuralOverview(
      "coordinating_body",
      coordinating_body_id,
      query.period ? Number(query.period) : null
    ),
  ]);

  return (
    <CoordinatingBodyDetailPage
      coordinatingBody={coordinatingBody}
      branches={branches}
      trainings={trainingResult.list}
      structuralPeriods={structuralOverview.periods}
      selectedStructuralPeriod={structuralOverview.selectedPeriod}
      selectedStructuralPeriodId={structuralOverview.selectedPeriodId}
      initialTab={parseTab(query.tab)}
      backHref={`/organizations/${organization_id}/coordinating-bodies`}
      allowEdit={false}
    />
  );
}
