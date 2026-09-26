import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChapterDetail } from "@/apis/chapters";
import { listFeeds } from "@/apis/feeds";
import { getSession } from "@/apis/session";
import OfficialAccountPage from "@/components/pages/OfficialAccountPage";
import PageState from "@/components/states/PageState";
import { holdsGrantAtEntity } from "@/lib/access";
import { formatEntityAuthorName } from "@/lib/feed-author";

interface ChapterOfficialRouteProps {
  params: Promise<{ chapter_id: string }>;
}

export const metadata: Metadata = {
  title: "Akun Resmi",
  robots: { index: false, follow: false },
};

export default async function ChapterOfficialAccount({
  params,
}: ChapterOfficialRouteProps) {
  const { chapter_id } = await params;
  const { user } = await getSession();

  // Speaking as an entity belongs to its own admins, so Super Admin is refused here too.
  if (!holdsGrantAtEntity(user, "chapter", chapter_id)) {
    return <PageState variant="forbidden" />;
  }

  const chapter = await getChapterDetail(chapter_id);
  if (!chapter || chapter.status !== "active") return notFound();

  const timeline = await listFeeds({ page: 1, pageSize: 20 });

  return (
    <OfficialAccountPage
      entityType="chapter"
      entityId={chapter_id}
      name={formatEntityAuthorName("chapter", chapter.name)}
      imageUrl={chapter.image_url}
      initialItems={timeline.list}
      initialHasMore={timeline.hasMore}
      viewer={user}
    />
  );
}
