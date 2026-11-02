import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { listAllBranchesAdmin } from "@/apis/branches";
import { listCoordinatingBodiesAdmin } from "@/apis/coordinating-bodies";
import { getOrganizationDetail } from "@/apis/organizations";
import { getSession } from "@/apis/session";
import { resolveActingEntity } from "@/lib/acting-entity";
import EntityProfilePage from "@/components/pages/EntityProfilePage";
import { loadEntityProfileFeeds } from "@/lib/entity-profile-data";
import {
  canonicalEntityProfileHref,
  entityProfileHandle,
  redirectToCanonicalEntityProfile,
  resolveEntityProfileSegment,
} from "@/lib/entity-profile-route";
import { entityProfileMetadata, kaderMeta } from "@/lib/entity-profile";
import { entityProfileHref, formatEntityAuthorName } from "@/lib/feed-author";

interface OrganizationProfileRouteProps {
  params: Promise<{ organization_id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

// Shared by generateMetadata and the page, so one request resolves the segment.
const loadOrganization = cache((segment: string) =>
  resolveEntityProfileSegment(segment, getOrganizationDetail),
);

export async function generateMetadata({
  params,
}: OrganizationProfileRouteProps): Promise<Metadata> {
  const { organization_id: segment } = await params;
  const organization = (await loadOrganization(segment))?.entity;

  return entityProfileMetadata({
    canonicalPath: entityProfileHref(
      "organization",
      organization ? entityProfileHandle(organization) : segment,
    ),
    name: organization
      ? formatEntityAuthorName("organization", organization.name)
      : null,
    status: organization?.status,
  });
}

export default async function OrganizationProfile({
  params,
  searchParams,
}: OrganizationProfileRouteProps) {
  const { organization_id: segment } = await params;
  const [{ user: viewer }, resolved, query] = await Promise.all([
    getSession(),
    loadOrganization(segment),
    searchParams,
  ]);

  if (!resolved || resolved.entity.status !== "active") return notFound();
  redirectToCanonicalEntityProfile("organization", segment, resolved, query);
  const organization = resolved.entity;
  const organization_id = organization.id;

  const actingEntity = await resolveActingEntity(
    viewer,

    query?.as,
  );

  const [coordinatingBodies, branches, feeds] = await Promise.all([
    listCoordinatingBodiesAdmin({
      organizationId: organization_id,
      status: "active",
      pageSize: 100,
    }),
    listAllBranchesAdmin({ organizationId: organization_id, status: "active" }),
    loadEntityProfileFeeds("organization", organization_id),
  ]);

  return (
    <EntityProfilePage
      entity={{
        entityType: "organization",
        entityId: organization_id,
        mentionName: organization.mention_name,
        profileHref: canonicalEntityProfileHref("organization", organization),
        name: formatEntityAuthorName("organization", organization.name),
        imageUrl: organization.logo_url,
        // organizations/detail carries no description, so the Tentang card stays hidden here.
        description: null,
        parents: [],
        stats: [
          { label: "Badko", value: coordinatingBodies.list.length },
          { label: "Cabang", value: branches.length },
          {
            label: "Kader",
            value: branches.reduce(
              (total, row) => total + (row.user_count ?? 0),
              0,
            ),
          },
        ],
        feeds,
        children: {
          tab: "branches",
          title: "Daftar Cabang",
          items: branches.map((row) => ({
            id: row.id,
            name: formatEntityAuthorName("branch", row.name),
            href: canonicalEntityProfileHref("branch", row),
            imageUrl: row.image_url,
            meta: kaderMeta(row.user_count),
          })),
        },
      }}
      actingEntity={actingEntity}
      viewer={viewer}
    />
  );
}
