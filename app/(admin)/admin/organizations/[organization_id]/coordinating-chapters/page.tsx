import type { Metadata } from "next";
import { getBranchDetail } from "@/apis/branches";
import { listCoordinatingChaptersAdmin } from "@/apis/coordinating-chapters";
import AdminCoordinatingChapterListPage from "@/components/pages/AdminCoordinatingChapterListPage";
import type { StatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Daftar Korkom",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 20;

interface OrganizationCoordinatingChaptersPageProps {
  params: Promise<{ organization_id: string }>;
  searchParams: Promise<{
    branch_id?: string;
    search?: string;
    status?: string;
    page?: string;
  }>;
}

// Unscoped like the Organization member roster: this deployment manages the one ORGANIZATION_ID.
export default async function OrganizationCoordinatingChaptersPage({
  params,
  searchParams,
}: OrganizationCoordinatingChaptersPageProps) {
  const [{ organization_id }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const branchId = query.branch_id?.trim() ?? "";
  const search = query.search?.trim() ?? "";
  const status = query.status ?? "";
  const page = Number(query.page ?? "1") || 1;

  const [branch, result] = await Promise.all([
    branchId ? getBranchDetail(branchId) : Promise.resolve(null),
    listCoordinatingChaptersAdmin({
      branchId: branchId || undefined,
      search: search || undefined,
      status: (status || undefined) as StatusEnum | undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);

  return (
    <AdminCoordinatingChapterListPage
      coordinatingChapters={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      initialStatus={status}
      pageSize={PAGE_SIZE}
      selectedBranch={branch ? { id: branch.id, name: branch.name } : null}
      allowCreate={false}
      allowEdit={false}
      allowDelete={false}
      detailBasePath={`/organizations/${organization_id}/coordinating-chapters`}
    />
  );
}
