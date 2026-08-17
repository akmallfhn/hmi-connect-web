import type { ReactNode } from "react";
import { getCoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import { getSession } from "@/apis/session";
import { getMainSiteOrigin } from "@/lib/constants";
import EntitySidebar from "@/components/navigations/EntitySidebar";
import PageState from "@/components/states/PageState";

interface CoordinatingBodyLayoutProps {
  children: ReactNode;
  params: Promise<{ coordinating_body_id: string }>;
}

export default async function CoordinatingBodyLayout({
  children,
  params,
}: CoordinatingBodyLayoutProps) {
  const { coordinating_body_id } = await params;
  const { user } = await getSession();

  const isSuperAdmin = user?.role_name === "Super Admin";
  const canManageThisCoordinatingBody =
    Boolean(user?.can_manage_coordinating_body) &&
    user?.coordinating_body_id === coordinating_body_id;

  if (!isSuperAdmin && !canManageThisCoordinatingBody) {
    return (
      <PageState
        variant="forbidden"
        backHref={getMainSiteOrigin()}
        message="Kamu tidak memiliki akses untuk mengelola Badko ini."
      />
    );
  }

  const coordinatingBody =
    await getCoordinatingBodyDetail(coordinating_body_id);
  if (!coordinatingBody) {
    return <PageState variant="not_found" backHref={getMainSiteOrigin()} />;
  }

  if (coordinatingBody.status === "inactive") {
    return (
      <PageState
        variant="forbidden"
        backHref={getMainSiteOrigin()}
        message="Badko ini sedang tidak aktif dan tidak dapat dikelola."
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
      <EntitySidebar
        scope="coordinating_body"
        entityId={coordinatingBody.id}
        entityName={coordinatingBody.name}
        parentName={user?.organization_name ?? "HMI"}
        imageUrl={coordinatingBody.image_url}
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
