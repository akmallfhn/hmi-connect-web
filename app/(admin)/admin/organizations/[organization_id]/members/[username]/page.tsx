import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/apis/session";
import { getUserByUsername } from "@/apis/users";
import AdminMemberDetailPage from "@/components/pages/AdminMemberDetailPage";

interface OrganizationMemberDetailRouteProps {
  params: Promise<{ organization_id: string; username: string }>;
}

export async function generateMetadata({
  params,
}: OrganizationMemberDetailRouteProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Detail Kader — ${username}`,
    robots: { index: false, follow: false },
  };
}

export default async function OrganizationMemberDetailRoute({
  params,
}: OrganizationMemberDetailRouteProps) {
  const { organization_id, username } = await params;
  const { sessionToken } = await getSession();
  const user = await getUserByUsername(username, sessionToken);

  // Pending users can still be part of this single-organization roster before choosing a chapter.
  if (!user || (user.organization_id && user.organization_id !== organization_id)) {
    notFound();
  }

  return (
    <AdminMemberDetailPage
      basePath={`/organizations/${organization_id}`}
      user={user}
    />
  );
}
