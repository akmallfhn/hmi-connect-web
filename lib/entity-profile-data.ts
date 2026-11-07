import "server-only";

import { getEntityFollowStatus, listEntityMembers } from "@/apis/entity-follows";
import { listEventsChronological } from "@/apis/events";
import { listEntityActivity } from "@/apis/feeds";
import { listTrainings } from "@/apis/trainings";
import { ENTITY_AGENDA_PAGE_SIZE } from "@/lib/entity-profile";
import type { MentionEntityTypeEnum } from "@/lib/types";

// The first page of every entity profile tab that isn't level-specific.
export async function loadEntityProfileFeeds(
  entityType: MentionEntityTypeEnum,
  entityId: string,
) {
  const [posts, members, follow, events, trainings] = await Promise.all([
    listEntityActivity(entityType, entityId, { page: 1, pageSize: 20 }),
    // A special body registers no kader of its own.
    entityType === "special_body"
      ? { list: [], totalData: 0, hasMore: false }
      : listEntityMembers(entityType, entityId),
    getEntityFollowStatus(entityType, entityId),
    listEventsChronological({
      entityType,
      entityId,
      pageSize: ENTITY_AGENDA_PAGE_SIZE,
    }),
    listTrainings({
      organizerType: entityType,
      organizerId: entityId,
      pageSize: ENTITY_AGENDA_PAGE_SIZE,
    }),
  ]);
  return { posts, members, follow, events, trainings };
}

export type EntityProfileFeeds = Awaited<ReturnType<typeof loadEntityProfileFeeds>>;
