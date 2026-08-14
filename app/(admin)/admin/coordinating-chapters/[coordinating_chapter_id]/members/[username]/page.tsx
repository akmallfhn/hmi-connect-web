import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/apis/session";
import { getUserByUsername } from "@/apis/users";
import AdminMemberDetailPage from "@/components/pages/AdminMemberDetailPage";

interface CoordinatingChapterMemberDetailRouteProps {
  params: Promise<{ coordinating_chapter_id: string; username: string }>;
}

export async function generateMetadata({
  params,
}: CoordinatingChapterMemberDetailRouteProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Detail Kader — ${username}`,
    robots: { index: false, follow: false },
  };
}

export default async function CoordinatingChapterMemberDetailRoute({
  params,
}: CoordinatingChapterMemberDetailRouteProps) {
  const { coordinating_chapter_id, username } = await params;
  const { sessionToken } = await getSession();
  const user = await getUserByUsername(username, sessionToken);

  if (!user || user.coordinating_chapter_id !== coordinating_chapter_id) {
    notFound();
  }

  return (
    <AdminMemberDetailPage
      basePath={`/coordinating-chapters/${coordinating_chapter_id}`}
      user={user}
    />
  );
}
