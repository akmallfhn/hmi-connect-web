import "server-only";

import { notFound } from "next/navigation";
import { getSession } from "@/apis/session";
import {
  resolveSpecialBodyParent,
} from "@/apis/special-bodies";
import EntityProfilePage from "@/components/pages/EntityProfilePage";
import { resolveActingEntity } from "@/lib/acting-entity";
import { loadEntityProfileFeeds } from "@/lib/entity-profile-data";
import {
  entityProfileHandle,
  redirectToCanonicalProfile,
} from "@/lib/entity-profile-route";
import { entityProfileHref } from "@/lib/feed-author";
import {
  formatSpecialBodyName,
  formatSpecialBodyParent,
  SPECIAL_BODY_LABEL,
} from "@/lib/special-body";
import { resolveSpecialBodyForType, specialBodyCanonicalHref } from "@/lib/special-body-profile";
import type { SpecialBodyTypeEnum } from "@/lib/types";

type ProfileSearchParams = Record<string, string | string[] | undefined>;

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
    resolveSpecialBodyForType(type, segment),
  ]);

  if (!resolved || resolved.entity.status !== "active") return notFound();
  const body = resolved.entity;
  const canonicalHref = specialBodyCanonicalHref(type, entityProfileHandle(body));
  redirectToCanonicalProfile(canonicalHref, segment, resolved, searchParams);

  const [actingEntity, parent, feeds] = await Promise.all([
    resolveActingEntity(viewer),
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
