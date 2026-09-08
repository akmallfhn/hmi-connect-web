import type { Metadata } from "next";
import type { ReactNode } from "react";
import { listMyAccessGrants } from "@/apis/access-grants";
import { getSession } from "@/apis/session";
import { HeaderAdminAccessProvider } from "@/components/navigations/HeaderAdminAccessContext";
import { manageGrants } from "@/lib/access";
import { getAdminSiteOrigin, PROD_MAIN_SITE_URL } from "@/lib/constants";

const siteDescription =
  "HMI Connect adalah ruang digital kader HMI untuk terhubung, berbagi kabar, dan mengelola data keanggotaan.";

export const metadata: Metadata = {
  // Pinned to production like EMAIL_SITE_ORIGIN — canonical/OG URLs are read off-site, where a dev origin means nothing.
  metadataBase: new URL(PROD_MAIN_SITE_URL),
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

async function listGrantEntityLogos(): Promise<Map<string, string | null>> {
  const { list } = await listMyAccessGrants({ pageSize: 100 });
  return new Map(
    list.map((grant) => [grant.entity_id, grant.entity_image_url ?? null]),
  );
}

export default async function WwwLayout({ children }: { children: ReactNode }) {
  const { user } = await getSession();
  const grants = user ? manageGrants(user) : [];
  // Only a grant holder pays for this lookup, and only because check-session omits the entity logo.
  const logos = grants.length > 0 ? await listGrantEntityLogos() : new Map();
  const adminAccess = user
    ? {
        adminOrigin: getAdminSiteOrigin(),
        roleName: user.role_name,
        grants: grants.map((grant) => ({
          ...grant,
          entity_image_url: logos.get(grant.entity_id) ?? null,
        })),
      }
    : null;

  return (
    <HeaderAdminAccessProvider value={adminAccess}>
      {children}
    </HeaderAdminAccessProvider>
  );
}
