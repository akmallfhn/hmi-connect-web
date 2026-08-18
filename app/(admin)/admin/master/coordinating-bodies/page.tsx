import type { Metadata } from "next";
import { listCoordinatingBodiesAdmin } from "@/apis/coordinating-bodies";
import AdminCoordinatingBodyListPage from "@/components/pages/AdminCoordinatingBodyListPage";
import type { StatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Kelola Badko",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 18;

interface MasterCoordinatingBodiesPageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function MasterCoordinatingBodiesPage({
  searchParams,
}: MasterCoordinatingBodiesPageProps) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const status = params.status ?? "";
  const page = Number(params.page ?? "1") || 1;

  const result = await listCoordinatingBodiesAdmin({
    search: search || undefined,
    status: (status || undefined) as StatusEnum | undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <AdminCoordinatingBodyListPage
      coordinatingBodies={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      initialStatus={status}
      pageSize={PAGE_SIZE}
    />
  );
}
