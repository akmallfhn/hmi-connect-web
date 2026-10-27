import type { Metadata } from "next";
import { listOrganizationalDocuments } from "@/apis/organizational-documents";
import AdminOrganizationalDocumentListPage from "@/components/pages/AdminOrganizationalDocumentListPage";
import { getMainSiteOrigin } from "@/lib/constants";
import { localDateKey } from "@/lib/time-manipulation";
import type { StatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Pedoman Organisasi",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 20;

export default async function OrganizationOrganizationalDocumentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ organization_id: string }>;
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const [{ organization_id }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const search = query.search?.trim() ?? "";
  const status =
    query.status === "active" || query.status === "inactive"
      ? query.status
      : "";
  const page = Number(query.page ?? "1") || 1;

  const result = await listOrganizationalDocuments({
    search: search || undefined,
    status: (status || undefined) as StatusEnum | undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <AdminOrganizationalDocumentListPage
      documents={result.list.filter(
        (document) => document.organization_id === organization_id
      )}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      initialStatus={status}
      organizationId={organization_id}
      defaultPublishedDate={localDateKey()}
      mainSiteOrigin={getMainSiteOrigin()}
    />
  );
}
