import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import { getStructuralOverview } from "@/apis/structurals";
import StructuralPage from "@/components/pages/StructuralPage";

export const metadata: Metadata = {
  title: "Struktur Kepengurusan Organisasi",
  robots: { index: false, follow: false },
};

interface OrganizationStructuralRouteProps {
  params: Promise<{ organization_id: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function OrganizationStructuralRoute({
  params,
  searchParams,
}: OrganizationStructuralRouteProps) {
  const { organization_id } = await params;
  const { period } = await searchParams;

  const [{ user }, overview] = await Promise.all([
    getSession(),
    getStructuralOverview(
      "organization",
      organization_id,
      period ? Number(period) : null
    ),
  ]);

  const isSuperAdmin = user?.role_name === "Super Admin";
  const canManage =
    isSuperAdmin ||
    (Boolean(user?.can_manage_organization) &&
      user?.organization_id === organization_id);

  return (
    <StructuralPage
      entityType="organization"
      entityId={organization_id}
      periods={overview.periods}
      selectedPeriod={overview.selectedPeriod}
      selectedPeriodId={overview.selectedPeriodId}
      canManage={canManage}
    />
  );
}
