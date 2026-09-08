import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBranchDetail } from "@/apis/branches";
import { listEntityActivity } from "@/apis/feeds";
import { getSession } from "@/apis/session";
import EntityActivitiesPage from "@/components/pages/EntityActivitiesPage";
import { entityActivitiesMetadata } from "@/lib/entity-profile";
import { entityProfileHref, formatEntityAuthorName } from "@/lib/feed-author";

interface BranchActivitiesRouteProps {
  params: Promise<{ branch_id: string }>;
}

export async function generateMetadata({
  params,
}: BranchActivitiesRouteProps): Promise<Metadata> {
  const { branch_id } = await params;
  const branch = await getBranchDetail(branch_id);

  return entityActivitiesMetadata({
    entityType: "branch",
    entityId: branch_id,
    name: branch ? formatEntityAuthorName("branch", branch.name) : null,
  });
}

export default async function BranchActivities({
  params,
}: BranchActivitiesRouteProps) {
  const { branch_id } = await params;
  const [{ user: viewer }, branch] = await Promise.all([
    getSession(),
    getBranchDetail(branch_id),
  ]);

  if (!branch || branch.status !== "active") return notFound();

  const activity = await listEntityActivity("branch", branch_id, {
    page: 1,
    pageSize: 20,
  });

  return (
    <EntityActivitiesPage
      entityType="branch"
      entityId={branch_id}
      entity={{
        name: formatEntityAuthorName("branch", branch.name),
        imageUrl: branch.image_url,
        href: entityProfileHref("branch", branch_id),
      }}
      initialItems={activity.list}
      initialHasMore={activity.hasMore}
      viewer={viewer}
    />
  );
}
