import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import { getSession } from "@/apis/session";
import OfficialAccountPage from "@/components/pages/OfficialAccountPage";
import PageState from "@/components/states/PageState";
import { holdsGrantAtEntity } from "@/lib/access";
import { formatEntityAuthorName } from "@/lib/feed-author";

interface CoordinatingBodyOfficialRouteProps {
  params: Promise<{ coordinating_body_id: string }>;
}

export const metadata: Metadata = {
  title: "Akun Resmi",
  robots: { index: false, follow: false },
};

export default async function CoordinatingBodyOfficialAccount({
  params,
}: CoordinatingBodyOfficialRouteProps) {
  const { coordinating_body_id } = await params;
  const { user } = await getSession();

  // Speaking as an entity belongs to its own admins, so Super Admin is refused here too.
  if (!holdsGrantAtEntity(user, "coordinating_body", coordinating_body_id)) {
    return <PageState variant="forbidden" />;
  }

  const coordinatingBody =
    await getCoordinatingBodyDetail(coordinating_body_id);
  if (!coordinatingBody || coordinatingBody.status !== "active")
    return notFound();

  return (
    <OfficialAccountPage
      entityType="coordinating_body"
      entityId={coordinating_body_id}
      name={formatEntityAuthorName("coordinating_body", coordinatingBody.name)}
      imageUrl={coordinatingBody.image_url}
      viewer={user}
    />
  );
}
