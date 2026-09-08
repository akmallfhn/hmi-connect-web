import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChapterDetail } from "@/apis/chapters";
import { listEntityActivity } from "@/apis/feeds";
import { getSession } from "@/apis/session";
import EntityActivitiesPage from "@/components/pages/EntityActivitiesPage";
import { entityActivitiesMetadata } from "@/lib/entity-profile";
import { entityProfileHref, formatEntityAuthorName } from "@/lib/feed-author";

interface ChapterActivitiesRouteProps {
  params: Promise<{ chapter_id: string }>;
}

export async function generateMetadata({
  params,
}: ChapterActivitiesRouteProps): Promise<Metadata> {
  const { chapter_id } = await params;
  const chapter = await getChapterDetail(chapter_id);

  return entityActivitiesMetadata({
    entityType: "chapter",
    entityId: chapter_id,
    name: chapter ? formatEntityAuthorName("chapter", chapter.name) : null,
  });
}

export default async function ChapterActivities({
  params,
}: ChapterActivitiesRouteProps) {
  const { chapter_id } = await params;
  const [{ user: viewer }, chapter] = await Promise.all([
    getSession(),
    getChapterDetail(chapter_id),
  ]);

  if (!chapter || chapter.status !== "active") return notFound();

  const activity = await listEntityActivity("chapter", chapter_id, {
    page: 1,
    pageSize: 20,
  });

  return (
    <EntityActivitiesPage
      entityType="chapter"
      entityId={chapter_id}
      entity={{
        name: formatEntityAuthorName("chapter", chapter.name),
        imageUrl: chapter.image_url,
        href: entityProfileHref("chapter", chapter_id),
      }}
      initialItems={activity.list}
      initialHasMore={activity.hasMore}
      viewer={viewer}
    />
  );
}
