import type { Metadata } from "next";
import {
  getBranchSummary,
  getChapterDistribution,
  getChapterStatus,
  getMembershipStatus,
  getUserGrowth,
} from "@/apis/stat";
import BranchDashboardPage from "@/components/pages/BranchDashboardPage";

export const metadata: Metadata = {
  title: "Dashboard Cabang",
  robots: {
    index: false,
    follow: false,
  },
};

interface BranchDashboardRouteProps {
  params: Promise<{ branch_id: string }>;
}

export default async function BranchDashboardRoute({
  params,
}: BranchDashboardRouteProps) {
  const { branch_id } = await params;
  const [
    summary,
    chapterDistribution,
    userGrowthDay,
    userGrowthWeek,
    userGrowthMonth,
    membershipStatus,
    chapterStatus,
  ] = await Promise.all([
    getBranchSummary(branch_id),
    getChapterDistribution(branch_id),
    getUserGrowth("day", branch_id),
    getUserGrowth("week", branch_id),
    getUserGrowth("month", branch_id),
    getMembershipStatus(branch_id),
    getChapterStatus(branch_id),
  ]);

  return (
    <BranchDashboardPage
      summary={summary}
      chapterDistribution={chapterDistribution}
      userGrowthDay={userGrowthDay?.list ?? []}
      userGrowthWeek={userGrowthWeek?.list ?? []}
      userGrowthMonth={userGrowthMonth?.list ?? []}
      membershipStatus={membershipStatus}
      chapterStatus={chapterStatus}
    />
  );
}
