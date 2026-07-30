import type { Metadata } from "next";
import { listVerificationRequests } from "@/apis/access";
import BranchVerificationListPage from "@/components/pages/BranchVerificationListPage";
import type { VerificationRequestStatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Permintaan Verifikasi",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 20;

interface BranchVerificationRequestsPageProps {
  params: Promise<{ branch_id: string }>;
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function BranchVerificationRequestsPage({
  params,
  searchParams,
}: BranchVerificationRequestsPageProps) {
  const { branch_id } = await params;
  const query = await searchParams;
  const status = (query.status || "pending") as VerificationRequestStatusEnum;
  const page = Number(query.page ?? "1") || 1;

  const result = await listVerificationRequests({
    status,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <BranchVerificationListPage
      branchId={branch_id}
      requests={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialStatus={status}
      pageSize={PAGE_SIZE}
    />
  );
}
