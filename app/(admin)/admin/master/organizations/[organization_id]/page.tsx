import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listAllAccessGrants } from "@/apis/access-grants";
import { listCoordinatingBodiesAdmin } from "@/apis/coordinating-bodies";
import { getOrganizationDetail } from "@/apis/organizations";
import { getStructuralOverview } from "@/apis/structurals";
import { listUsers } from "@/apis/users";
import OrganizationDetailPage, {
  type OrganizationDetailTab,
} from "@/components/pages/OrganizationDetailPage";

export const metadata: Metadata = {
  title: "Detail Organisasi",
  robots: {
    index: false,
    follow: false,
  },
};

interface MasterOrganizationDetailPageProps {
  params: Promise<{ organization_id: string }>;
  searchParams: Promise<{ tab?: string; period?: string }>;
}

function parseTab(tab?: string): OrganizationDetailTab {
  if (tab === "management" || tab === "access") return tab;
  return "profile";
}

export default async function MasterOrganizationDetailPage({
  params,
  searchParams,
}: MasterOrganizationDetailPageProps) {
  const [{ organization_id }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const organization = await getOrganizationDetail(organization_id);
  if (!organization) notFound();

  const [
    coordinatingBodyResult,
    memberResult,
    structuralOverview,
    accessGrants,
  ] = await Promise.all([
    listCoordinatingBodiesAdmin({
      organizationId: organization_id,
      page: 1,
      pageSize: 1,
    }),
    listUsers({
      organizationId: organization_id,
      status: "active",
      page: 1,
      pageSize: 1,
    }),
    getStructuralOverview(
      "organization",
      organization_id,
      query.period ? Number(query.period) : null
    ),
    listAllAccessGrants("organization", organization_id),
  ]);

  return (
    <OrganizationDetailPage
      organization={organization}
      coordinatingBodyCount={coordinatingBodyResult.totalData}
      memberCount={memberResult.totalData}
      structuralPeriods={structuralOverview.periods}
      selectedStructuralPeriod={structuralOverview.selectedPeriod}
      selectedStructuralPeriodId={structuralOverview.selectedPeriodId}
      accessGrants={accessGrants}
      canManageAccess
      initialTab={parseTab(query.tab)}
    />
  );
}
