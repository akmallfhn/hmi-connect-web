import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/apis/session";
import { getUserByUsername } from "@/apis/users";
import AdminUserDetailPage from "@/components/pages/AdminUserDetailPage";

interface MasterUserDetailPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: MasterUserDetailPageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Detail Pengguna — ${username}`,
    robots: { index: false, follow: false },
  };
}

// Keyed by username, not the raw user id — mirrors /profile/[username], since users/detail has no lookup-by-id.
export default async function MasterUserDetailPage({
  params,
}: MasterUserDetailPageProps) {
  const { username } = await params;
  const { sessionToken } = await getSession();
  const user = await getUserByUsername(username, sessionToken);

  if (!user) notFound();

  return <AdminUserDetailPage user={user} />;
}
