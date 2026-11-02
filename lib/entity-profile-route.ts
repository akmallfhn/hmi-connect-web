import "server-only";

import { permanentRedirect, redirect } from "next/navigation";
import type { EntityDetailKey } from "@/apis/api";
import { entityProfileHref } from "@/lib/feed-author";
import { isMentionNameFormatValid } from "@/lib/mentions";
import type { AccessEntityTypeEnum } from "@/lib/types";

type ProfileEntity = { id: string; mention_name_normalized: string };

export type ResolvedEntityProfile<T extends ProfileEntity> = {
  entity: T;
  matchedBy: EntityDetailKey;
};

type ProfileSearchParams = Record<string, string | string[] | undefined>;

// A profile segment is the lowercase mention name, or a legacy id that still resolves and redirects.
export async function resolveEntityProfileSegment<T extends ProfileEntity>(
  segment: string,
  lookup: (identifier: string, by: EntityDetailKey) => Promise<T | null>,
): Promise<ResolvedEntityProfile<T> | null> {
  if (isMentionNameFormatValid(segment)) {
    const entity = await lookup(segment, "mention_name");
    if (entity) return { entity, matchedBy: "mention_name" };
  }
  const entity = await lookup(segment, "id");
  return entity ? { entity, matchedBy: "id" } : null;
}

// The canonical handle, falling back to the id for a row the backend has not given a mention name.
export function entityProfileHandle(entity: ProfileEntity): string {
  return entity.mention_name_normalized || entity.id;
}

export function canonicalEntityProfileHref(
  entityType: AccessEntityTypeEnum,
  entity: ProfileEntity,
): string {
  return entityProfileHref(entityType, entityProfileHandle(entity));
}

export function redirectToCanonicalEntityProfile<T extends ProfileEntity>(
  entityType: AccessEntityTypeEnum,
  segment: string,
  resolved: ResolvedEntityProfile<T>,
  searchParams: ProfileSearchParams = {},
) {
  redirectToCanonicalProfile(
    canonicalEntityProfileHref(entityType, resolved.entity),
    segment,
    resolved,
    searchParams,
  );
}

// Shared with profiles whose path isn't an entity level, such as /kohati/{handle}.
export function redirectToCanonicalProfile<T extends ProfileEntity>(
  canonicalHref: string,
  segment: string,
  resolved: ResolvedEntityProfile<T>,
  searchParams: ProfileSearchParams = {},
) {
  if (segment === entityProfileHandle(resolved.entity)) return;

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    for (const item of Array.isArray(value) ? value : value ? [value] : []) {
      query.append(key, item);
    }
  }
  const search = query.toString();
  const href = `${canonicalHref}${search ? `?${search}` : ""}`;

  // A casing fix is permanent; an id redirect is not, since the mention name can still be renamed.
  if (resolved.matchedBy === "mention_name") permanentRedirect(href);
  redirect(href);
}
