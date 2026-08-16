import type { Metadata } from "next";
import {
  getBranchMap,
  getBranchDistribution,
  getBranchStatus,
  getChapterStatus,
  getOrganizationSummary,
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
  const [
    summary,
    branchDistribution,
    userGrowthDay,
    userGrowthWeek,
    userGrowthMonth,
    branchStatus,
    chapterStatus,
    branchMap,
    trainingPriorities,
  ] = await Promise.all([
    getOrganizationSummary(organization_id),
    getBranchDistribution(),
    getUserGrowth({ granularity: "day" }),
    getUserGrowth({ granularity: "week" }),
    getUserGrowth({ granularity: "month" }),
    getBranchStatus(),
    getChapterStatus(),
    getBranchMap({ coverage: "nationwide" }),
    getTrainingPriorities({ entity: "branch", page: 1, pageSize: 5 }),
  ]);

  return (
    <MasterDashboardPage
      summary={summary}
      branchDistribution={branchDistribution}
      userGrowthDay={userGrowthDay?.list ?? []}
      userGrowthWeek={userGrowthWeek?.list ?? []}
      userGrowthMonth={userGrowthMonth?.list ?? []}
      branchStatus={branchStatus}
      chapterStatus={chapterStatus}
      branchMapEntries={branchMap?.list ?? []}
      trainingPriorities={trainingPriorities}
      showAttentionLists
      showBanner
      showIndonesiaMap
    />
  );
}
