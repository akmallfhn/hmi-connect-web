import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrganizationDetail } from "@/apis/organizations";
import { listEntityActivity } from "@/apis/feeds";
import { getSession } from "@/apis/session";
import OfficialAccountPage from "@/components/pages/OfficialAccountPage";
import PageState from "@/components/states/PageState";
import { holdsGrantAtEntity } from "@/lib/access";
import { formatEntityAuthorName } from "@/lib/feed-author";

interface OrganizationOfficialRouteProps {
  params: Promise<{ organization_id: string }>;
}

export const metadata: Metadata = {
  title: "Akun Resmi",
  robots: { index: false, follow: false },
};

export default async function OrganizationOfficialAccount({
  params,
}: OrganizationOfficialRouteProps) {
  const { organization_id } = await params;
  const { user } = await getSession();

  // Speaking as an entity belongs to its own admins, so Super Admin is refused here too.
  if (!holdsGrantAtEntity(user, "organization", organization_id)) {
    return <PageState variant="forbidden" />;
  }

  const organization = await getOrganizationDetail(organization_id);
  if (!organization || organization.status !== "active") return notFound();

  const activity = await listEntityActivity("organization", organization_id, {
    page: 1,
    pageSize: 20,
  });

  return (
    <OfficialAccountPage
      entityType="organization"
      entityId={organization_id}
      name={formatEntityAuthorName("organization", organization.name)}
      imageUrl={organization.logo_url}
      initialItems={activity.list}
      initialHasMore={activity.hasMore}
      viewer={user}
    />
  );
}
