import type { ReactNode } from "react";
import { getSession } from "@/apis/session";
import { getMainSiteOrigin } from "@/lib/constants";
import EntitySidebar from "@/components/navigations/EntitySidebar";
import PageState from "@/components/states/PageState";

interface OrganizationLayoutProps {
  children: ReactNode;
  params: Promise<{ organization_id: string }>;
}

export default async function OrganizationLayout({
  children,
  params,
}: OrganizationLayoutProps) {
  const { organization_id } = await params;
  const { user } = await getSession();
  const configuredOrganizationId = process.env.ORGANIZATION_ID;

  const isSuperAdmin = user?.role_name === "Super Admin";
  const canManageThisOrganization =
    Boolean(user?.can_manage_organization) &&
    user?.organization_id === organization_id;

  if (!isSuperAdmin && !canManageThisOrganization) {
    return (
      <PageState
        variant="forbidden"
        backHref={getMainSiteOrigin()}
        message="Kamu tidak memiliki akses untuk mengelola Organisasi ini."
      />
    );
  }

  if (
    configuredOrganizationId &&
    organization_id !== configuredOrganizationId
  ) {
    return <PageState variant="not_found" backHref={getMainSiteOrigin()} />;
  }

  const organizationName =
    user?.organization_id === organization_id
      ? (user.organization_name ?? "HMI")
      : "HMI";

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
      <EntitySidebar
        storageKey="organization_sidebar_collapsed"
        href={`/organizations/${organization_id}`}
        entityLabel="Organisasi"
        entityName={organizationName}
        fullName={user?.full_name}
        avatar={user?.avatar}
        roleName={user?.role_name}
      />
      <main className="min-h-screen min-w-0 flex-1 lg:min-h-0 lg:overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
