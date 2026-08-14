import type { Metadata } from "next";
import { listVerificationRequestsForReview } from "@/apis/access";
import { getBranchDetail } from "@/apis/branches";
import { VerificationRequestListPage } from "@/components/pages/BranchVerificationListPage";
import type { VerificationRequestStatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Permintaan Verifikasi",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

interface OrganizationVerificationRequestsPageProps {
  searchParams: Promise<{
    branch_id?: string;
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function OrganizationVerificationRequestsPage({
  searchParams,
}: OrganizationVerificationRequestsPageProps) {
  const query = await searchParams;
  const branchId = query.branch_id?.trim() || undefined;
  const status = query.status ?? "";
  const search = query.search?.trim() || undefined;
  const page = Number(query.page ?? "1") || 1;

  const [branch, result] = await Promise.all([
    branchId ? getBranchDetail(branchId) : Promise.resolve(null),
    listVerificationRequestsForReview({
      branchId,
      status: (status || undefined) as
        | VerificationRequestStatusEnum
        | undefined,
      search,
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);

  return (
    <VerificationRequestListPage
      requests={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialStatus={status}
      initialSearch={search ?? ""}
      description="Lihat seluruh pengajuan verifikasi identitas kader di Pengurus Besar HMI."
      showBranchFilter
      selectedBranch={
        branch ? { id: branch.id, name: branch.name } : null
      }
      allowReviewActions={false}
    />
  );
}
