import type { Metadata } from "next";
import { listTrainings } from "@/apis/trainings";
import { getSession } from "@/apis/session";
import BranchTrainingListPage from "@/components/pages/BranchTrainingListPage";

export const metadata: Metadata = {
  title: "Latihan Kader 2",
  robots: {
    index: false,
    follow: false,
  },
};

interface BranchTrainingListRouteProps {
  params: Promise<{ branch_id: string }>;
  searchParams: Promise<{ search?: string; page?: string }>;
}

const PAGE_SIZE = 12;

export default async function BranchTrainingListRoute({
  params,
  searchParams,
}: BranchTrainingListRouteProps) {
  const { branch_id } = await params;
  const query = await searchParams;
  const search = query.search?.trim() ?? "";
  const page = Math.max(1, Number(query.page ?? "1") || 1);
  const [result, { user }] = await Promise.all([
    listTrainings({
      search: search || undefined,
      level: "LK2",
      organizerType: "branch",
      organizerId: branch_id,
      page,
      pageSize: PAGE_SIZE,
    }),
    getSession(),
  ]);
  const canManageTrainings =
    user?.role_name === "Super Admin" || user?.role_name === "Administrator";

  return (
    <BranchTrainingListPage
      branchId={branch_id}
      trainings={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      pageSize={PAGE_SIZE}
      canManageTrainings={canManageTrainings}
    />
  );
}
