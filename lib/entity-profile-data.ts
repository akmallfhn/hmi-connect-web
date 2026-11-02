import "server-only";

import { getEntityFollowStatus, listEntityMembers } from "@/apis/entity-follows";
import { listEntityActivity } from "@/apis/feeds";
import type { MentionEntityTypeEnum } from "@/lib/types";

// The first page of every entity profile tab that isn't level-specific: posts, kader, and the viewer's follow state.
export async function loadEntityProfileFeeds(
  entityType: MentionEntityTypeEnum,
  entityId: string,
) {
  const [posts, members, follow] = await Promise.all([
    listEntityActivity(entityType, entityId, { page: 1, pageSize: 20 }),
    // A special body registers no kader of its own.
    entityType === "special_body"
      ? { list: [], totalData: 0, hasMore: false }
      : listEntityMembers(entityType, entityId),
    getEntityFollowStatus(entityType, entityId),
  ]);
  return { posts, members, follow };
}

export type EntityProfileFeeds = Awaited<ReturnType<typeof loadEntityProfileFeeds>>;
