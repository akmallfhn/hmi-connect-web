import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import { listEntityActivity } from "@/apis/feeds";
import { getSession } from "@/apis/session";
import EntityActivitiesPage from "@/components/pages/EntityActivitiesPage";
import { entityActivitiesMetadata } from "@/lib/entity-profile";
import { entityProfileHref, formatEntityAuthorName } from "@/lib/feed-author";

interface CoordinatingBodyActivitiesRouteProps {
  params: Promise<{ coordinating_body_id: string }>;
}

export async function generateMetadata({
  params,
}: CoordinatingBodyActivitiesRouteProps): Promise<Metadata> {
  const { coordinating_body_id } = await params;
  const coordinatingBody =
    await getCoordinatingBodyDetail(coordinating_body_id);

  return entityActivitiesMetadata({
    entityType: "coordinating_body",
    entityId: coordinating_body_id,
    name: coordinatingBody
      ? formatEntityAuthorName("coordinating_body", coordinatingBody.name)
      : null,
  });
}

export default async function CoordinatingBodyActivities({
  params,
}: CoordinatingBodyActivitiesRouteProps) {
  const { coordinating_body_id } = await params;
  const [{ user: viewer }, coordinatingBody] = await Promise.all([
    getSession(),
    getCoordinatingBodyDetail(coordinating_body_id),
  ]);

  if (!coordinatingBody || coordinatingBody.status !== "active")
    return notFound();

  const activity = await listEntityActivity(
    "coordinating_body",
    coordinating_body_id,
    {
      page: 1,
      pageSize: 20,
    },
  );

  return (
    <EntityActivitiesPage
      entityType="coordinating_body"
      entityId={coordinating_body_id}
      entity={{
        name: formatEntityAuthorName(
          "coordinating_body",
          coordinatingBody.name,
        ),
        imageUrl: coordinatingBody.image_url,
        href: entityProfileHref("coordinating_body", coordinating_body_id),
      }}
      initialItems={activity.list}
      initialHasMore={activity.hasMore}
      viewer={viewer}
    />
  );
}
