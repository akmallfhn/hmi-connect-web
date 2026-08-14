import type { Metadata } from "next";
import { listVerificationRequestsForReview } from "@/apis/verification-requests";
import BranchVerificationListPage from "@/components/pages/BranchVerificationListPage";
import type { VerificationRequestStatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Permintaan Verifikasi",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

interface BranchVerificationRequestsPageProps {
  params: Promise<{ branch_id: string }>;
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}

export default async function BranchVerificationRequestsPage({
  params,
  searchParams,
}: BranchVerificationRequestsPageProps) {
  const { branch_id } = await params;
  const query = await searchParams;
  const status = query.status ?? "";
  const search = query.search?.trim() ?? "";
  const page = Number(query.page ?? "1") || 1;

  const result = await listVerificationRequestsForReview({
    branchId: branch_id,
    status: (status || undefined) as
      | VerificationRequestStatusEnum
      | undefined,
    search: search || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <BranchVerificationListPage
      requests={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialStatus={status}
      initialSearch={search}
    />
  );
}
