import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBranchDetail } from "@/apis/branches";
import { listEntityActivity } from "@/apis/feeds";
import { getSession } from "@/apis/session";
import OfficialAccountPage from "@/components/pages/OfficialAccountPage";
import PageState from "@/components/states/PageState";
import { holdsGrantAtEntity } from "@/lib/access";
import { formatEntityAuthorName } from "@/lib/feed-author";

interface BranchOfficialRouteProps {
  params: Promise<{ branch_id: string }>;
}

export const metadata: Metadata = {
  title: "Akun Resmi",
  robots: { index: false, follow: false },
};

export default async function BranchOfficialAccount({
  params,
}: BranchOfficialRouteProps) {
  const { branch_id } = await params;
  const { user } = await getSession();

  // Speaking as an entity belongs to its own admins, so Super Admin is refused here too.
  if (!holdsGrantAtEntity(user, "branch", branch_id)) {
    return <PageState variant="forbidden" />;
  }

  const branch = await getBranchDetail(branch_id);
  if (!branch || branch.status !== "active") return notFound();

  const activity = await listEntityActivity("branch", branch_id, {
    page: 1,
    pageSize: 20,
  });

  return (
    <OfficialAccountPage
      entityType="branch"
      entityId={branch_id}
      name={formatEntityAuthorName("branch", branch.name)}
      imageUrl={branch.image_url}
      initialItems={activity.list}
      initialHasMore={activity.hasMore}
      viewer={user}
    />
  );
}
