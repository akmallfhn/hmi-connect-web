import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getOrganizationalDocumentDetail,
  listAllOrganizationalDocuments,
} from "@/apis/organizational-documents";
import OrganizationalDocumentDetailPage from "@/components/pages/OrganizationalDocumentDetailPage";
import { DEV_MAIN_SITE_URL, PROD_MAIN_SITE_URL } from "@/lib/constants";
import {
  compareNewestDocument,
  ORGANIZATIONAL_DOCUMENT_TYPE_DETAILS,
} from "@/lib/organizational-document";

type Params = Promise<{ document_slug: string; document_id: string }>;

// A PDF hosted in this app's own public folder loads same-origin, so local dev needs no CORS from production.
function toViewerFileUrl(fileUrl: string) {
  try {
    const url = new URL(fileUrl);
    const ownOrigins = [PROD_MAIN_SITE_URL, DEV_MAIN_SITE_URL].map(
      (origin) => new URL(origin).origin
    );
    return ownOrigins.includes(url.origin)
      ? `${url.pathname}${url.search}`
      : fileUrl;
  } catch {
    return fileUrl;
  }
}

// The slug is decorative like an article's; only document_id resolves anything.
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { document_id } = await params;
  const document = await getOrganizationalDocumentDetail(Number(document_id));
  return {
    title: document?.title ?? "Pedoman Organisasi",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function OrganizationalDocument({
  params,
}: {
  params: Params;
}) {
  const { document_id } = await params;
  const [document, allDocuments] = await Promise.all([
    getOrganizationalDocumentDetail(Number(document_id)),
    listAllOrganizationalDocuments(),
  ]);
  if (!document) notFound();

  // Every active publication of the same type; the open one stays listed even if an admin opened it inactive.
  const versions = allDocuments
    .filter(
      (entry) =>
        entry.type === document.type &&
        (entry.status === "active" || entry.id === document.id)
    )
    .sort(compareNewestDocument)
    .map(({ id, title, slug_url, published_at, page_count, image_url }) => ({
      id,
      title,
      slug_url,
      published_at,
      page_count,
      image_url,
    }));

  return (
    <OrganizationalDocumentDetailPage
      key={document.id}
      document={{
        title: document.title,
        fileUrl: toViewerFileUrl(document.file_url),
        tableOfContents: document.table_of_contents ?? [],
      }}
      version={{
        currentId: document.id,
        typeLabel: ORGANIZATIONAL_DOCUMENT_TYPE_DETAILS[document.type].label,
        versions,
      }}
    />
  );
}
