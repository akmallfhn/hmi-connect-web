import "server-only";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getSession } from "@/apis/session";
import {
  getSpecialBodyDetail,
  resolveSpecialBodyParent,
} from "@/apis/special-bodies";
import EntityProfilePage from "@/components/pages/EntityProfilePage";
import { resolveActingEntity } from "@/lib/acting-entity";
import { entityProfileMetadata } from "@/lib/entity-profile";
import { loadEntityProfileFeeds } from "@/lib/entity-profile-data";
import {
  entityProfileHandle,
  redirectToCanonicalProfile,
  resolveEntityProfileSegment,
} from "@/lib/entity-profile-route";
import { entityProfileHref } from "@/lib/feed-author";
import {
  formatSpecialBodyName,
  formatSpecialBodyParent,
  SPECIAL_BODY_LABEL,
  specialBodyProfileHref,
} from "@/lib/special-body";
import type { SpecialBodyTypeEnum } from "@/lib/types";

type ProfileSearchParams = Record<string, string | string[] | undefined>;

// Shared by generateMetadata and the page, so one request resolves the segment.
const loadSpecialBody = cache((segment: string) =>
  resolveEntityProfileSegment(segment, getSpecialBodyDetail),
);

// A handle belonging to another special body type 404s here rather than rendering under the wrong path.
async function resolveForType(type: SpecialBodyTypeEnum, segment: string) {
  const resolved = await loadSpecialBody(segment);
  return resolved && resolved.entity.type === type ? resolved : null;
}

function profileHref(type: SpecialBodyTypeEnum, handle: string) {
  return specialBodyProfileHref(type, handle) ?? `/${type}/${handle}`;
}

export async function specialBodyProfileMetadata(
  type: SpecialBodyTypeEnum,
  segment: string,
): Promise<Metadata> {
  const body = (await resolveForType(type, segment))?.entity;
  return entityProfileMetadata({
    canonicalPath: profileHref(type, body ? entityProfileHandle(body) : segment),
    name: body
      ? formatSpecialBodyName(body.type, body.parent_entity_type, body.name)
      : null,
    description: body?.description,
    status: body?.status,
  });
}

export async function SpecialBodyProfile({
  type,
  segment,
  searchParams,
}: {
  type: SpecialBodyTypeEnum;
  segment: string;
  searchParams: ProfileSearchParams;
}) {
  const [{ user: viewer }, resolved] = await Promise.all([
    getSession(),
    resolveForType(type, segment),
  ]);

  if (!resolved || resolved.entity.status !== "active") return notFound();
  const body = resolved.entity;
  const canonicalHref = profileHref(type, entityProfileHandle(body));
  redirectToCanonicalProfile(canonicalHref, segment, resolved, searchParams);

  const [actingEntity, parent, feeds] = await Promise.all([
    resolveActingEntity(viewer, searchParams.as),
    resolveSpecialBodyParent(body.parent_entity_type, body.parent_entity_id),
    loadEntityProfileFeeds("special_body", body.id),
  ]);

  return (
    <EntityProfilePage
      entity={{
        entityType: "special_body",
        specialBodyType: body.type,
        affiliationLead: `${SPECIAL_BODY_LABEL[body.type]} ini merupakan badan khusus aktif di bawah naungan`,
        entityId: body.id,
        name: formatSpecialBodyName(body.type, body.parent_entity_type, body.name),
        mentionName: body.mention_name,
        profileHref: canonicalHref,
        imageUrl: body.image_url ?? null,
        description: body.description ?? null,
        parents: parent
          ? [
              {
                label: formatSpecialBodyParent(body.parent_entity_type, parent.name),
                href: entityProfileHref(body.parent_entity_type, body.parent_entity_id),
              },
            ]
          : [],
        stats: [],
        feeds,
        children: null,
      }}
      actingEntity={actingEntity}
      viewer={viewer}
    />
  );
}
