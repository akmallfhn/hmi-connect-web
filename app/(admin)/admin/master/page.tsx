import type { Metadata } from "next";
import {
  getBranchDistribution,
  getBranchStatus,
  getChapterStatus,
  getStatSummary,
  getUserGrowth,
} from "@/apis/stat";
import MasterDashboardPage from "@/components/pages/MasterDashboardPage";

export const metadata: Metadata = {
  title: "Master Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MasterPage() {
  const [
    summary,
    branchDistribution,
    userGrowthDay,
    userGrowthWeek,
    userGrowthMonth,
    branchStatus,
    chapterStatus,
  ] = await Promise.all([
    getStatSummary(),
    getBranchDistribution(),
    getUserGrowth("day"),
    getUserGrowth("week"),
    getUserGrowth("month"),
    getBranchStatus(),
    getChapterStatus(),
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
      showAttentionLists
      showBanner
      showIndonesiaMap
    />
  );
}
