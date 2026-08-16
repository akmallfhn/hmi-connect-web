import type { Metadata } from "next";
import { getCoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import {
  getBranchDistribution,
  getBranchMap,
  getBranchStatus,
  getChapterStatus,
  getCoordinatingBodySummary,
  getTrainingPriorities,
  getUserGrowth,
} from "@/apis/stat";
import CoordinatingBodyDashboardPage from "@/components/pages/CoordinatingBodyDashboardPage";

export const metadata: Metadata = {
  title: "Dashboard Badko",
  robots: {
    index: false,
    follow: false,
  },
};

interface CoordinatingBodyDetailPageProps {
  params: Promise<{ coordinating_body_id: string }>;
}

export default async function CoordinatingBodyDetailPage({
  params,
}: CoordinatingBodyDetailPageProps) {
  const { coordinating_body_id } = await params;
  const [
    coordinatingBody,
    summary,
    branchMap,
    branchDistribution,
    userGrowthDay,
    userGrowthWeek,
    userGrowthMonth,
    branchStatus,
    chapterStatus,
    trainingPriorities,
  ] = await Promise.all([
    getCoordinatingBodyDetail(coordinating_body_id),
    getCoordinatingBodySummary(coordinating_body_id),
    getBranchMap({
      coverage: "nationwide",
      coordinatingBodyId: coordinating_body_id,
    }),
    getBranchDistribution({ coordinatingBodyId: coordinating_body_id }),
    getUserGrowth({
      granularity: "day",
      coordinatingBodyId: coordinating_body_id,
    }),
    getUserGrowth({
      granularity: "week",
      coordinatingBodyId: coordinating_body_id,
    }),
    getUserGrowth({
      granularity: "month",
      coordinatingBodyId: coordinating_body_id,
    }),
    getBranchStatus({ coordinatingBodyId: coordinating_body_id }),
    getChapterStatus({ coordinatingBodyId: coordinating_body_id }),
    getTrainingPriorities({
      entity: "branch",
      coordinatingBodyId: coordinating_body_id,
      page: 1,
      pageSize: 5,
    }),
  ]);
  return (
    <CoordinatingBodyDashboardPage
      coordinatingBodyId={coordinating_body_id}
      coordinatingBodyName={coordinatingBody?.name ?? "ini"}
      summary={summary}
      branchMapEntries={branchMap?.list ?? []}
      branchDistribution={branchDistribution}
      userGrowthDay={userGrowthDay?.list ?? []}
      userGrowthWeek={userGrowthWeek?.list ?? []}
      userGrowthMonth={userGrowthMonth?.list ?? []}
      branchStatus={branchStatus}
      chapterStatus={chapterStatus}
      trainingPriorities={trainingPriorities}
    />
  );
}
