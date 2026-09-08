import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrganizationDetail } from "@/apis/organizations";
import { listEntityActivity } from "@/apis/feeds";
import { getSession } from "@/apis/session";
import EntityActivitiesPage from "@/components/pages/EntityActivitiesPage";
import { entityActivitiesMetadata } from "@/lib/entity-profile";
import { entityProfileHref, formatEntityAuthorName } from "@/lib/feed-author";

interface OrganizationActivitiesRouteProps {
  params: Promise<{ organization_id: string }>;
}

export async function generateMetadata({
  params,
}: OrganizationActivitiesRouteProps): Promise<Metadata> {
  const { organization_id } = await params;
  const organization = await getOrganizationDetail(organization_id);

  return entityActivitiesMetadata({
    entityType: "organization",
    entityId: organization_id,
    name: organization
      ? formatEntityAuthorName("organization", organization.name)
      : null,
  });
}

export default async function OrganizationActivities({
  params,
}: OrganizationActivitiesRouteProps) {
  const { organization_id } = await params;
  const [{ user: viewer }, organization] = await Promise.all([
    getSession(),
    getOrganizationDetail(organization_id),
  ]);

  if (!organization || organization.status !== "active") return notFound();

  const activity = await listEntityActivity("organization", organization_id, {
    page: 1,
    pageSize: 20,
  });

  return (
    <EntityActivitiesPage
      entityType="organization"
      entityId={organization_id}
      entity={{
        name: formatEntityAuthorName("organization", organization.name),
        imageUrl: organization.logo_url,
        href: entityProfileHref("organization", organization_id),
      }}
      initialItems={activity.list}
      initialHasMore={activity.hasMore}
      viewer={viewer}
    />
  );
}
