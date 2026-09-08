import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCoordinatingChapterDetail } from "@/apis/coordinating-chapters";
import { listEntityActivity } from "@/apis/feeds";
import { getSession } from "@/apis/session";
import EntityActivitiesPage from "@/components/pages/EntityActivitiesPage";
import { entityActivitiesMetadata } from "@/lib/entity-profile";
import { entityProfileHref, formatEntityAuthorName } from "@/lib/feed-author";

interface CoordinatingChapterActivitiesRouteProps {
  params: Promise<{ coordinating_chapter_id: string }>;
}

export async function generateMetadata({
  params,
}: CoordinatingChapterActivitiesRouteProps): Promise<Metadata> {
  const { coordinating_chapter_id } = await params;
  const coordinatingChapter = await getCoordinatingChapterDetail(
    coordinating_chapter_id,
  );

  return entityActivitiesMetadata({
    entityType: "coordinating_chapter",
    entityId: coordinating_chapter_id,
    name: coordinatingChapter
      ? formatEntityAuthorName("coordinating_chapter", coordinatingChapter.name)
      : null,
  });
}

export default async function CoordinatingChapterActivities({
  params,
}: CoordinatingChapterActivitiesRouteProps) {
  const { coordinating_chapter_id } = await params;
  const [{ user: viewer }, coordinatingChapter] = await Promise.all([
    getSession(),
    getCoordinatingChapterDetail(coordinating_chapter_id),
  ]);

  if (!coordinatingChapter || coordinatingChapter.status !== "active")
    return notFound();

  const activity = await listEntityActivity(
    "coordinating_chapter",
    coordinating_chapter_id,
    {
      page: 1,
      pageSize: 20,
    },
  );

  return (
    <EntityActivitiesPage
      entityType="coordinating_chapter"
      entityId={coordinating_chapter_id}
      entity={{
        name: formatEntityAuthorName(
          "coordinating_chapter",
          coordinatingChapter.name,
        ),
        imageUrl: coordinatingChapter.image_url,
        href: entityProfileHref(
          "coordinating_chapter",
          coordinating_chapter_id,
        ),
      }}
      initialItems={activity.list}
      initialHasMore={activity.hasMore}
      viewer={viewer}
    />
  );
}
