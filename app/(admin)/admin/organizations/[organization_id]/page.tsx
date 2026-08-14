import type { Metadata } from "next";
import {
  getBranchDistribution,
  getBranchStatus,
  getCoordinatingBodyStatus,
  getMembershipStatus,
  getStatSummary,
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

export default async function OrganizationDetailPage() {
  const [
    summary,
    branchDistribution,
    userGrowthDay,
    userGrowthWeek,
    userGrowthMonth,
    membershipStatus,
    branchStatus,
    coordinatingBodyStatus,
  ] = await Promise.all([
    getStatSummary(),
    getBranchDistribution(),
    getUserGrowth("day"),
    getUserGrowth("week"),
    getUserGrowth("month"),
    getMembershipStatus(),
    getBranchStatus(),
    getCoordinatingBodyStatus(),
  ]);

  return (
    <MasterDashboardPage
      summary={summary}
      branchDistribution={branchDistribution}
      userGrowthDay={userGrowthDay?.list ?? []}
      userGrowthWeek={userGrowthWeek?.list ?? []}
      userGrowthMonth={userGrowthMonth?.list ?? []}
      membershipStatus={membershipStatus}
      branchStatus={branchStatus}
      coordinatingBodyStatus={coordinatingBodyStatus}
    />
  );
}
