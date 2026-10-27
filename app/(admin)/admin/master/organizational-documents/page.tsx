import type { Metadata } from "next";
import { listOrganizationalDocuments } from "@/apis/organizational-documents";
import { getSession } from "@/apis/session";
import AdminOrganizationalDocumentListPage from "@/components/pages/AdminOrganizationalDocumentListPage";
import PageState from "@/components/states/PageState";
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

export default async function MasterOrganizationalDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const [query, { user }] = await Promise.all([searchParams, getSession()]);
  // This deployment manages one organization, so Master writes under it like its sidebar link does.
  const organizationId = user?.organization_id ?? process.env.ORGANIZATION_ID;
  if (!organizationId) return <PageState variant="not_found" />;
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
      documents={result.list}
      totalData={result.totalData}
      totalPage={result.totalPage}
      currentPage={result.currentPage}
      initialSearch={search}
      initialStatus={status}
      organizationId={organizationId}
      defaultPublishedDate={localDateKey()}
      mainSiteOrigin={getMainSiteOrigin()}
    />
  );
}
