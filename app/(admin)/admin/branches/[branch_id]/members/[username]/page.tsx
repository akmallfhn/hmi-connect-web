import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/apis/session";
import { getUserByUsername } from "@/apis/users";
import BranchMemberDetailPage from "@/components/pages/BranchMemberDetailPage";

interface BranchMemberDetailRouteProps {
  params: Promise<{ branch_id: string; username: string }>;
}

export async function generateMetadata({
  params,
}: BranchMemberDetailRouteProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Detail Kader — ${username}`,
    robots: { index: false, follow: false },
  };
}

// Keyed by username, not the raw user id — mirrors /master/users/[username], since users/detail has no lookup-by-id.
export default async function BranchMemberDetailRoute({
  params,
}: BranchMemberDetailRouteProps) {
  const { branch_id, username } = await params;
  const { sessionToken } = await getSession();
  const user = await getUserByUsername(username, sessionToken);

  // A user outside this branch isn't a valid resource under this branch's own member roster.
  if (!user || user.branch_id !== branch_id) notFound();

  return <BranchMemberDetailPage branchId={branch_id} user={user} />;
}
