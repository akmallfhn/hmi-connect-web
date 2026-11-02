import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { listAllBranchesAdmin } from "@/apis/branches";
import {
  getCoordinatingBodyDetail,
  listCoordinatingBodiesAdmin,
} from "@/apis/coordinating-bodies";
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
import { ORGANIZATION_SHORT_NAME } from "@/lib/constants";
import { entityProfileHref, formatEntityAuthorName } from "@/lib/feed-author";

interface CoordinatingBodyProfileRouteProps {
  params: Promise<{ coordinating_body_id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

// Shared by generateMetadata and the page, so one request resolves the segment.
const loadCoordinatingBody = cache((segment: string) =>
  resolveEntityProfileSegment(segment, getCoordinatingBodyDetail),
);

export async function generateMetadata({
  params,
}: CoordinatingBodyProfileRouteProps): Promise<Metadata> {
  const { coordinating_body_id: segment } = await params;
  const coordinatingBody = (await loadCoordinatingBody(segment))?.entity;

  return entityProfileMetadata({
    canonicalPath: entityProfileHref(
      "coordinating_body",
      coordinatingBody ? entityProfileHandle(coordinatingBody) : segment,
    ),
    name: coordinatingBody
      ? formatEntityAuthorName("coordinating_body", coordinatingBody.name)
      : null,
    description: coordinatingBody?.description,
    status: coordinatingBody?.status,
  });
}

export default async function CoordinatingBodyProfile({
  params,
  searchParams,
}: CoordinatingBodyProfileRouteProps) {
  const { coordinating_body_id: segment } = await params;
  const [{ user: viewer }, resolved, query] = await Promise.all([
    getSession(),
    loadCoordinatingBody(segment),
    searchParams,
  ]);

  if (!resolved || resolved.entity.status !== "active") return notFound();
  redirectToCanonicalEntityProfile("coordinating_body", segment, resolved, query);
  const coordinatingBody = resolved.entity;
  const coordinating_body_id = coordinatingBody.id;

  const actingEntity = await resolveActingEntity(
    viewer,

    query?.as,
  );

  // A Badko's own kader/Cabang counts are only exposed on the organization's own Badko list row.
  const [siblings, branches, feeds] = await Promise.all([
    listCoordinatingBodiesAdmin({ status: "active", pageSize: 100 }),
    listAllBranchesAdmin({
      coordinatingBodyId: coordinating_body_id,
      status: "active",
    }),
    loadEntityProfileFeeds("coordinating_body", coordinating_body_id),
  ]);
  const self = siblings.list.find((row) => row.id === coordinating_body_id);

  return (
    <EntityProfilePage
      entity={{
        entityType: "coordinating_body",
        entityId: coordinating_body_id,
        mentionName: coordinatingBody.mention_name,
        profileHref: canonicalEntityProfileHref("coordinating_body", coordinatingBody),
        name: formatEntityAuthorName(
          "coordinating_body",
          coordinatingBody.name,
        ),
        imageUrl: coordinatingBody.image_url,
        description: coordinatingBody.description,
        parents: [
          {
            label: ORGANIZATION_SHORT_NAME,
            href: entityProfileHref("organization", coordinatingBody.organization_id),
          },
        ],
        stats: [
          { label: "Cabang", value: self?.branch_count ?? branches.length },
          {
            label: "Komisariat",
            value: branches.reduce(
              (total, row) => total + (row.chapter_count ?? 0),
              0,
            ),
          },
          { label: "Kader", value: self?.user_count ?? 0 },
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
