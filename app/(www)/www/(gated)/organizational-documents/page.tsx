import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import { listAllOrganizationalDocuments } from "@/apis/organizational-documents";
import OrganizationalDocumentListPage from "@/components/pages/OrganizationalDocumentListPage";

export const metadata: Metadata = {
  title: "Pedoman Organisasi",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrganizationalDocuments() {
  const [{ user }, documents] = await Promise.all([
    getSession(),
    listAllOrganizationalDocuments(),
  ]);

  return (
    <OrganizationalDocumentListPage
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        verificationStatus: user?.verification_status,
      }}
      documents={documents.filter((document) => document.status === "active")}
    />
  );
}
