import type { Metadata } from "next";
import { listAllBranchesAdmin } from "@/apis/branches";
import {
  getBranchMap,
  getBranchDistribution,
  getBranchStatus,
  getChapterStatus,
  getOrganizationSummary,
  getSuspendedEntities,
  getTrainingPriorities,
  getUserGrowth,
} from "@/apis/stat";
import MasterDashboardPage from "@/components/pages/MasterDashboardPage";

export const metadata: Metadata = {
  title: "Dashboard Organisasi",
  robots: {
    index: false,
    follow: false,
  },
};

interface OrganizationDetailPageProps {
  params: Promise<{ organization_id: string }>;
}

export default async function OrganizationDetailPage({
  params,
}: OrganizationDetailPageProps) {
  const { organization_id } = await params;

  // Every aggregate is scoped to this organization — Master is the only dashboard that reads them unscoped.
  const [
    summary,
    branchDistribution,
    branchMemberCounts,
    userGrowthDay,
    userGrowthWeek,
    userGrowthMonth,
    branchStatus,
    chapterStatus,
    branchMap,
    trainingPriorities,
    suspendedBranches,
    suspendedCoordinatingBodies,
  ] = await Promise.all([
    getOrganizationSummary(organization_id),
    getBranchDistribution({ organizationId: organization_id }),
    listAllBranchesAdmin({ organizationId: organization_id }),
    getUserGrowth({ granularity: "day", organizationId: organization_id }),
    getUserGrowth({ granularity: "week", organizationId: organization_id }),
    getUserGrowth({ granularity: "month", organizationId: organization_id }),
    getBranchStatus({ organizationId: organization_id }),
    getChapterStatus({ organizationId: organization_id }),
    getBranchMap({ coverage: "nationwide", organizationId: organization_id }),
    getTrainingPriorities({
      entity: "branch",
      organizationId: organization_id,
      page: 1,
      pageSize: 5,
    }),
    getSuspendedEntities({
      entityType: "branch",
      organizationId: organization_id,
      page: 1,
      pageSize: 5,
    }),
    getSuspendedEntities({
      entityType: "coordinating_body",
      organizationId: organization_id,
      page: 1,
      pageSize: 5,
    }),
  ]);

  return (
    <MasterDashboardPage
      summary={summary}
      branchDistribution={branchDistribution}
      branchMemberCounts={branchMemberCounts}
      userGrowthDay={userGrowthDay?.list ?? []}
      userGrowthWeek={userGrowthWeek?.list ?? []}
      userGrowthMonth={userGrowthMonth?.list ?? []}
      branchStatus={branchStatus}
      chapterStatus={chapterStatus}
      branchMapEntries={branchMap?.list ?? []}
      trainingPriorities={trainingPriorities}
      suspendedBranches={suspendedBranches}
      suspendedCoordinatingBodies={suspendedCoordinatingBodies}
      organizationId={organization_id}
      showAttentionLists
      showBanner
      showIndonesiaMap
    />
  );
}
