import "server-only";

import type { Metadata } from "next";
import { cache } from "react";
import { getSpecialBodyDetail } from "@/apis/special-bodies";
import { entityProfileMetadata } from "@/lib/entity-profile";
import {
  entityProfileHandle,
  resolveEntityProfileSegment,
} from "@/lib/entity-profile-route";
import { formatSpecialBodyName, specialBodyProfileHref } from "@/lib/special-body";
import type { SpecialBodyTypeEnum } from "@/lib/types";

// Shared by generateMetadata and the page, so one request resolves the segment.
const loadSpecialBody = cache((segment: string) =>
  resolveEntityProfileSegment(segment, getSpecialBodyDetail),
);

// A handle belonging to another special body type 404s here.
export async function resolveSpecialBodyForType(type: SpecialBodyTypeEnum, segment: string) {
  const resolved = await loadSpecialBody(segment);
  return resolved && resolved.entity.type === type ? resolved : null;
}

export function specialBodyCanonicalHref(type: SpecialBodyTypeEnum, handle: string) {
  return specialBodyProfileHref(type, handle) ?? `/${type}/${handle}`;
}

export async function specialBodyProfileMetadata(
  type: SpecialBodyTypeEnum,
  segment: string,
): Promise<Metadata> {
  const body = (await resolveSpecialBodyForType(type, segment))?.entity;
  return entityProfileMetadata({
    canonicalPath: specialBodyCanonicalHref(type, body ? entityProfileHandle(body) : segment),
    name: body
      ? formatSpecialBodyName(body.type, body.parent_entity_type, body.name)
      : null,
    description: body?.description,
    status: body?.status,
  });
}
