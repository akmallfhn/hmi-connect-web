import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import { getStructuralOverview } from "@/apis/structurals";
import StructuralPage from "@/components/pages/StructuralPage";

export const metadata: Metadata = {
  title: "Struktur Kepengurusan Badko",
  robots: { index: false, follow: false },
};

interface CoordinatingBodyStructuralRouteProps {
  params: Promise<{ coordinating_body_id: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function CoordinatingBodyStructuralRoute({
  params,
  searchParams,
}: CoordinatingBodyStructuralRouteProps) {
  const { coordinating_body_id } = await params;
  const { period } = await searchParams;

  const [{ user }, overview] = await Promise.all([
    getSession(),
    getStructuralOverview(
      "coordinating_body",
      coordinating_body_id,
      period ? Number(period) : null
    ),
  ]);

  const isSuperAdmin = user?.role_name === "Super Admin";
  const canManage =
    isSuperAdmin ||
    (Boolean(user?.can_manage_coordinating_body) &&
      user?.coordinating_body_id === coordinating_body_id);

  return (
    <StructuralPage
      entityType="coordinating_body"
      entityId={coordinating_body_id}
      periods={overview.periods}
      selectedPeriod={overview.selectedPeriod}
      selectedPeriodId={overview.selectedPeriodId}
      canManage={canManage}
    />
  );
}
