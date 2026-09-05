import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import { getSession } from "@/apis/session";
import { canManageEntity } from "@/lib/access";
import { listAllAccessGrants } from "@/apis/access-grants";
import CoordinatingBodySettingsPage from "@/components/pages/CoordinatingBodySettingsPage";

export const metadata: Metadata = {
  title: "Pengaturan Badko",
  robots: { index: false, follow: false },
};

interface CoordinatingBodySettingsRouteProps {
  params: Promise<{ coordinating_body_id: string }>;
}

export default async function CoordinatingBodySettingsRoute({
  params,
}: CoordinatingBodySettingsRouteProps) {
  const { coordinating_body_id } = await params;
  const [{ user }, coordinatingBody, grants] = await Promise.all([
    getSession(),
    getCoordinatingBodyDetail(coordinating_body_id),
    listAllAccessGrants("coordinating_body", coordinating_body_id),
  ]);

  if (!coordinatingBody) notFound();

  return (
    <CoordinatingBodySettingsPage
      coordinatingBody={coordinatingBody}
      grants={grants}
      canManageAccess={canManageEntity(user, "coordinating_body", coordinating_body_id)}
    />
  );
}
