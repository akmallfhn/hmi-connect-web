import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import { getStructuralOverview } from "@/apis/structurals";
import StructuralPage from "@/components/pages/StructuralPage";

export const metadata: Metadata = {
  title: "Struktur Kepengurusan Cabang",
  robots: { index: false, follow: false },
};

interface BranchStructuralRouteProps {
  params: Promise<{ branch_id: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function BranchStructuralRoute({
  params,
  searchParams,
}: BranchStructuralRouteProps) {
  const { branch_id } = await params;
  const { period } = await searchParams;

  const [{ user }, overview] = await Promise.all([
    getSession(),
    getStructuralOverview("branch", branch_id, period ? Number(period) : null),
  ]);

  const isSuperAdmin = user?.role_name === "Super Admin";
  const canManage =
    isSuperAdmin ||
    (Boolean(user?.can_manage_branch) && user?.branch_id === branch_id);

  return (
    <StructuralPage
      entityType="branch"
      entityId={branch_id}
      periods={overview.periods}
      selectedPeriod={overview.selectedPeriod}
      selectedPeriodId={overview.selectedPeriodId}
      canManage={canManage}
    />
  );
}
