import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/apis/session";
import { getUserByUsername } from "@/apis/users";
import AdminMemberDetailPage from "@/components/pages/AdminMemberDetailPage";

interface CoordinatingBodyMemberDetailRouteProps {
  params: Promise<{ coordinating_body_id: string; username: string }>;
}

export async function generateMetadata({
  params,
}: CoordinatingBodyMemberDetailRouteProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Detail Kader — ${username}`,
    robots: { index: false, follow: false },
  };
}

export default async function CoordinatingBodyMemberDetailRoute({
  params,
}: CoordinatingBodyMemberDetailRouteProps) {
  const { coordinating_body_id, username } = await params;
  const { sessionToken } = await getSession();
  const user = await getUserByUsername(username, sessionToken);

  if (!user || user.coordinating_body_id !== coordinating_body_id) notFound();

  return (
    <AdminMemberDetailPage
      basePath={`/coordinating-bodies/${coordinating_body_id}`}
      user={user}
    />
  );
}
