import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCoordinatingChapterDetail } from "@/apis/coordinating-chapters";
import { listEntityActivity } from "@/apis/feeds";
import { getSession } from "@/apis/session";
import OfficialAccountPage from "@/components/pages/OfficialAccountPage";
import PageState from "@/components/states/PageState";
import { holdsGrantAtEntity } from "@/lib/access";
import { formatEntityAuthorName } from "@/lib/feed-author";

interface CoordinatingChapterOfficialRouteProps {
  params: Promise<{ coordinating_chapter_id: string }>;
}

export const metadata: Metadata = {
  title: "Akun Resmi",
  robots: { index: false, follow: false },
};

export default async function CoordinatingChapterOfficialAccount({
  params,
}: CoordinatingChapterOfficialRouteProps) {
  const { coordinating_chapter_id } = await params;
  const { user } = await getSession();

  // Speaking as an entity belongs to its own admins, so Super Admin is refused here too.
  if (
    !holdsGrantAtEntity(user, "coordinating_chapter", coordinating_chapter_id)
  ) {
    return <PageState variant="forbidden" />;
  }

  const coordinatingChapter = await getCoordinatingChapterDetail(
    coordinating_chapter_id,
  );
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
    <OfficialAccountPage
      entityType="coordinating_chapter"
      entityId={coordinating_chapter_id}
      name={formatEntityAuthorName(
        "coordinating_chapter",
        coordinatingChapter.name,
      )}
      imageUrl={coordinatingChapter.image_url}
      initialItems={activity.list}
      initialHasMore={activity.hasMore}
      viewer={user}
    />
  );
}
