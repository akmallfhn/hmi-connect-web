import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import { listOrganizationalDocuments } from "@/apis/organizational-documents";
import OrganizationalDocumentListPage from "@/components/pages/OrganizationalDocumentListPage";

export const metadata: Metadata = {
  title: "Pedoman Organisasi",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrganizationalDocuments({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search = "", page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const [{ user }, documents] = await Promise.all([
    getSession(),
    listOrganizationalDocuments({ search: search.trim(), page: currentPage }),
  ]);

  return (
    <OrganizationalDocumentListPage
      key={search}
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        verificationStatus: user?.verification_status,
      }}
      documents={documents.list}
      search={search.trim()}
      currentPage={documents.currentPage}
      totalPages={documents.totalPage}
    />
  );
}
