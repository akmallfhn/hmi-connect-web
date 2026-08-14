import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSession } from "@/apis/session";
import { HeaderAdminAccessProvider } from "@/components/navigations/HeaderAdminAccessContext";
import { getAdminSiteOrigin } from "@/lib/constants";

const siteDescription =
  "HMI Connect adalah ruang digital kader HMI untuk terhubung, berbagi kabar, dan mengelola data keanggotaan.";

function getMetadataBase() {
  const fallbackUrl = "https://hmi-connect-web.vercel.app";
  try {
    return new URL(process.env.NEXT_PUBLIC_BASE_URL ?? fallbackUrl);
  } catch {
    return new URL(fallbackUrl);
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  applicationName: "HMI Connect",
  title: {
    default: "HMI Connect",
    template: "%s | HMI Connect",
  },
  description: siteDescription,
  keywords: [
    "HMI",
    "HMI Connect",
    "Himpunan Mahasiswa Islam",
    "kader HMI",
    "keanggotaan HMI",
  ],
  authors: [{ name: "HMI Connect" }],
  creator: "HMI Connect",
  publisher: "HMI Connect",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "HMI Connect",
    title: "HMI Connect",
    description: siteDescription,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "HMI Connect",
    description: siteDescription,
  },
};

export default async function WwwLayout({ children }: { children: ReactNode }) {
  const { user } = await getSession();
  const adminAccess = user
    ? {
        adminOrigin: getAdminSiteOrigin(),
        roleName: user.role_name,
        organizationId: user.organization_id,
        organizationName: user.organization_name,
        canManageOrganization: Boolean(user.can_manage_organization),
        coordinatingBodyId: user.coordinating_body_id,
        coordinatingBodyName: user.coordinating_body_name,
        canManageCoordinatingBody: Boolean(user.can_manage_coordinating_body),
        branchId: user.branch_id,
        branchName: user.branch_name,
        canManageBranch: Boolean(user.can_manage_branch),
        coordinatingChapterId: user.coordinating_chapter_id,
        coordinatingChapterName: user.coordinating_chapter_name,
        canManageCoordinatingChapter: Boolean(
          user.can_manage_coordinating_chapter
        ),
        chapterId: user.chapter_id,
        chapterName: user.chapter_name,
        canManageChapter: Boolean(user.can_manage_chapter),
      }
    : null;

  return (
    <HeaderAdminAccessProvider value={adminAccess}>
      {children}
    </HeaderAdminAccessProvider>
  );
}
