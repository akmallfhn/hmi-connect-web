import type { Metadata } from "next";
import { listVerificationRequests, type VerificationRequestListEntry } from "@/apis/access";
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
// verification-requests/list has no "all statuses" value of its own — "Semua Status" merges all three in parallel instead, capped generously since this is a review queue, not a full archive.
const ALL_STATUS_FETCH_SIZE = 100;
const ALL_STATUSES: VerificationRequestStatusEnum[] = ["pending", "approved", "rejected"];

interface BranchVerificationRequestsPageProps {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}

export default async function BranchVerificationRequestsPage({
  searchParams,
}: BranchVerificationRequestsPageProps) {
  const query = await searchParams;
  const status = query.status ?? "";
  const search = query.search?.trim() ?? "";
  const page = Number(query.page ?? "1") || 1;

  let requests: VerificationRequestListEntry[];
  let totalData: number;
  let totalPage: number;
  let currentPage: number;

  if (status) {
    const result = await listVerificationRequests({
      status: status as VerificationRequestStatusEnum,
      search: search || undefined,
      page,
      pageSize: PAGE_SIZE,
    });
    requests = result.list;
    totalData = result.totalData;
    totalPage = result.totalPage;
    currentPage = result.currentPage;
  } else {
    const results = await Promise.all(
      ALL_STATUSES.map((s) =>
        listVerificationRequests({
          status: s,
          search: search || undefined,
          page: 1,
          pageSize: ALL_STATUS_FETCH_SIZE,
        })
      )
    );
    requests = results
      .flatMap((r) => r.list)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    totalData = requests.length;
    totalPage = 1;
    currentPage = 1;
  }

  return (
    <BranchVerificationListPage
      requests={requests}
      totalData={totalData}
      totalPage={totalPage}
      currentPage={currentPage}
      initialStatus={status}
      initialSearch={search}
    />
  );
}
