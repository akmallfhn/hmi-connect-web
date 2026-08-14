import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/apis/session";
import { getUserByUsername } from "@/apis/users";
import AdminMemberDetailPage from "@/components/pages/AdminMemberDetailPage";

interface ChapterMemberDetailRouteProps {
  params: Promise<{ chapter_id: string; username: string }>;
}

export async function generateMetadata({
  params,
}: ChapterMemberDetailRouteProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Detail Kader — ${username}`,
    robots: { index: false, follow: false },
  };
}

export default async function ChapterMemberDetailRoute({
  params,
}: ChapterMemberDetailRouteProps) {
  const { chapter_id, username } = await params;
  const { sessionToken } = await getSession();
  const user = await getUserByUsername(username, sessionToken);

  if (!user || user.chapter_id !== chapter_id) notFound();

  return (
    <AdminMemberDetailPage basePath={`/chapters/${chapter_id}`} user={user} />
  );
}
