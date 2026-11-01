import "server-only";

import { getEntityFollowStatus, listEntityMembers } from "@/apis/entity-follows";
import { listEntityActivity } from "@/apis/feeds";
import type { AccessEntityTypeEnum } from "@/lib/types";

// The first page of every entity profile tab that isn't level-specific: posts, kader, and the viewer's follow state.
export async function loadEntityProfileFeeds(
  entityType: AccessEntityTypeEnum,
  entityId: string,
) {
  const [posts, members, follow] = await Promise.all([
    listEntityActivity(entityType, entityId, { page: 1, pageSize: 20 }),
    listEntityMembers(entityType, entityId),
    getEntityFollowStatus(entityType, entityId),
  ]);
  return { posts, members, follow };
}

export type EntityProfileFeeds = Awaited<ReturnType<typeof loadEntityProfileFeeds>>;
