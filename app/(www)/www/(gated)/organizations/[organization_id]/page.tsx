import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listCoordinatingBodiesAdmin } from "@/apis/coordinating-bodies";
import { listEntityActivity } from "@/apis/feeds";
import { getOrganizationDetail } from "@/apis/organizations";
import { getSession } from "@/apis/session";
import { getStructuralOverview } from "@/apis/structurals";
import EntityProfilePage from "@/components/pages/EntityProfilePage";
import {
  entityLevelField,
  entityProfileMetadata,
  kaderMeta,
} from "@/lib/entity-profile";
import { entityProfileHref, formatEntityAuthorName } from "@/lib/feed-author";

interface OrganizationProfileRouteProps {
  params: Promise<{ organization_id: string }>;
}

export async function generateMetadata({
  params,
}: OrganizationProfileRouteProps): Promise<Metadata> {
  const { organization_id } = await params;
  const organization = await getOrganizationDetail(organization_id);

  return entityProfileMetadata({
    entityType: "organization",
    entityId: organization_id,
    name: organization
      ? formatEntityAuthorName("organization", organization.name)
      : null,
    status: organization?.status,
  });
}

export default async function OrganizationProfile({
  params,
}: OrganizationProfileRouteProps) {
  const { organization_id } = await params;
  const [{ user: viewer }, organization] = await Promise.all([
    getSession(),
    getOrganizationDetail(organization_id),
  ]);

  if (!organization || organization.status !== "active") return notFound();

  const [coordinatingBodies, structural, activity] = await Promise.all([
    listCoordinatingBodiesAdmin({
      organizationId: organization_id,
      status: "active",
      pageSize: 100,
    }),
    getStructuralOverview("organization", organization_id, null),
    listEntityActivity("organization", organization_id, { pageSize: 3 }),
  ]);

  return (
    <EntityProfilePage
      entity={{
        entityType: "organization",
        entityId: organization_id,
        name: formatEntityAuthorName("organization", organization.name),
        imageUrl: organization.logo_url,
        // organizations/detail carries no description, so the Tentang card stays hidden here.
        description: null,
        createdAt: organization.created_at,
        affiliations: [],
        infoFields: [entityLevelField("organization")],
        stats: [
          { label: "Badko", value: coordinatingBodies.list.length },
          {
            label: "Cabang",
            value: coordinatingBodies.list.reduce(
              (total, row) => total + (row.branch_count ?? 0),
              0
            ),
          },
          {
            label: "Kader",
            value: coordinatingBodies.list.reduce(
              (total, row) => total + (row.user_count ?? 0),
              0
            ),
          },
        ],
        structuralPeriod: structural.selectedPeriod,
        activities: activity.list,
        children: {
          title: "Daftar Badko",
          emptyMessage: "Belum ada Badko yang terdaftar.",
          items: coordinatingBodies.list.map((row) => ({
            id: row.id,
            name: formatEntityAuthorName("coordinating_body", row.name),
            href: entityProfileHref("coordinating_body", row.id),
            imageUrl: row.image_url,
            meta: kaderMeta(row.user_count),
          })),
        },
      }}
      viewer={viewer}
    />
  );
}
