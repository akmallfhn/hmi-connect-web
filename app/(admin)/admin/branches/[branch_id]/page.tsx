import type { Metadata } from "next";
import {
  getBranchSummary,
  getChapterDistribution,
  getChapterStatus,
  getVerificationCount,
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
    verificationCount,
    chapterStatus,
  ] = await Promise.all([
    getBranchSummary(branch_id),
    getChapterDistribution({ branchId: branch_id }),
    getUserGrowth({ granularity: "day", branchId: branch_id }),
    getUserGrowth({ granularity: "week", branchId: branch_id }),
    getUserGrowth({ granularity: "month", branchId: branch_id }),
    getVerificationCount({ branchId: branch_id }),
    getChapterStatus({ branchId: branch_id }),
  ]);

  return (
    <BranchDashboardPage
      summary={summary}
      chapterDistribution={chapterDistribution}
      userGrowthDay={userGrowthDay?.list ?? []}
      userGrowthWeek={userGrowthWeek?.list ?? []}
      userGrowthMonth={userGrowthMonth?.list ?? []}
      verificationCount={verificationCount}
      chapterStatus={chapterStatus}
    />
  );
}
