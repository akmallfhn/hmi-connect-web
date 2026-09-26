import "server-only";

import { cache } from "react";
import { listMyAccessGrants } from "@/apis/access-grants";
import type { SessionUser } from "@/apis/session";
import type { ComposerAuthorEntity } from "@/components/forms/CreateFeedForms";
import {
  holdsGrantAtEntity,
  manageGrants,
  parseActingEntityParam,
} from "@/lib/access";
import { formatEntityAuthorName } from "@/lib/feed-author";

// check-session omits the entity logo; cached so the layout and the page share one lookup per request.
export const listGrantEntityLogos = cache(
  async (): Promise<Map<string, string | null>> => {
    const { list } = await listMyAccessGrants({ pageSize: 100 });
    return new Map(
      list.map((grant) => [grant.entity_id, grant.entity_image_url ?? null]),
    );
  },
);

// Same gate as the official pages: a grant at exactly that entity, so Super Admin alone does not qualify.
export async function resolveActingEntity(
  user: SessionUser | null | undefined,
  rawParam: string | string[] | undefined,
): Promise<ComposerAuthorEntity | null> {
  const ref = parseActingEntityParam(rawParam);
  if (!ref || !holdsGrantAtEntity(user, ref.entityType, ref.entityId)) {
    return null;
  }

  const grant = manageGrants(user).find(
    (item) =>
      item.entity_type === ref.entityType && item.entity_id === ref.entityId,
  );
  const logos = await listGrantEntityLogos();

  return {
    type: ref.entityType,
    id: ref.entityId,
    name: grant?.entity_name
      ? formatEntityAuthorName(ref.entityType, grant.entity_name)
      : "Akun Resmi",
    imageUrl: logos.get(ref.entityId) ?? null,
  };
}
