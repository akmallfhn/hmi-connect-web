import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listAllAccessGrants } from "@/apis/access-grants";
import { getOrganizationDetail } from "@/apis/organizations";
import { getSession } from "@/apis/session";
import { canManageEntity } from "@/lib/access";
import OrganizationSettingsPage from "@/components/pages/OrganizationSettingsPage";

export const metadata: Metadata = {
  title: "Pengaturan Organisasi",
  robots: { index: false, follow: false },
};

interface OrganizationSettingsRouteProps {
  params: Promise<{ organization_id: string }>;
}

export default async function OrganizationSettingsRoute({
  params,
}: OrganizationSettingsRouteProps) {
  const { organization_id } = await params;
  const [{ user }, organization, grants] = await Promise.all([
    getSession(),
    getOrganizationDetail(organization_id),
    listAllAccessGrants("organization", organization_id),
  ]);

  if (!organization) notFound();

  return (
    <OrganizationSettingsPage
      organization={organization}
      grants={grants}
      canManageAccess={canManageEntity(user, "organization", organization_id)}
    />
  );
}
