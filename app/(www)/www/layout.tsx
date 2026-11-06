import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSession } from "@/apis/session";
import { getSpecialBodyDetail } from "@/apis/special-bodies";
import { HeaderAdminAccessProvider } from "@/components/navigations/HeaderAdminAccessContext";
import MainSiteDesktopShell from "@/components/navigations/MainSiteDesktopShell";
import ActivityQuerySync from "@/components/query/ActivityQuerySync";
import { manageGrants } from "@/lib/access";
import { listGrantEntityLogos, selectedActingEntityRef } from "@/lib/acting-entity";
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

export default async function WwwLayout({ children }: { children: ReactNode }) {
  const { user } = await getSession();
  const grants = user ? manageGrants(user) : [];
  const activeEntity = await selectedActingEntityRef(user);
  const activeBody = activeEntity?.entityType === "special_body"
    ? await getSpecialBodyDetail(activeEntity.entityId)
    : null;
  // Only a grant holder pays for this lookup, and only because check-session omits the entity logo.
  const logos = grants.length > 0 ? await listGrantEntityLogos() : new Map();
  const adminAccess = user
    ? {
        adminOrigin: getAdminSiteOrigin(),
        roleName: user.role_name,
        activeEntity,
        activeProfileHref: activeBody ? `/mentions/${activeBody.mention_name}` : undefined,
        grants: grants.map((grant) => ({
          ...grant,
          entity_image_url: logos.get(grant.entity_id) ?? null,
        })),
      }
    : null;

  return (
    <HeaderAdminAccessProvider value={adminAccess}>
      <ActivityQuerySync key={user?.id ?? "anonymous"} userId={user?.id} />
      <MainSiteDesktopShell
        userId={user?.id}
        fullName={user?.full_name}
        avatar={user?.avatar}
        username={user?.username}
        userStatus={user?.status}
        verificationStatus={user?.verification_status}
        isAlumni={user?.is_alumni}
      >
        {children}
      </MainSiteDesktopShell>
    </HeaderAdminAccessProvider>
  );
}
