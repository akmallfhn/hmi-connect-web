"use client";

import type { ActivityEntry } from "@/apis/feeds";
import type { ComposerAuthorEntity } from "@/components/forms/CreateFeedForms";
import { loadMoreEntityActivity } from "@/lib/actions";
import { entityPostsQueryKey } from "@/lib/entity-profile";
import type { MentionEntityTypeEnum } from "@/lib/types";
import FeedPostTimeline, {
  type PostTimelineViewer,
} from "../feeds/FeedPostTimeline";

interface EntityPostTimelineProps {
  entityType: MentionEntityTypeEnum;
  entityId: string;
  initialItems: ActivityEntry[];
  initialHasMore: boolean;
  viewer: PostTimelineViewer;
  actingEntity?: ComposerAuthorEntity | null;
}

export default function EntityPostTimeline({
  entityType,
  entityId,
  initialItems,
  initialHasMore,
  viewer,
  actingEntity,
}: EntityPostTimelineProps) {
  // Only someone speaking as this very entity may delete its posts.
  const actingAsSelf =
    actingEntity?.type === entityType && actingEntity.id === entityId;

  return (
    <FeedPostTimeline
      queryKey={entityPostsQueryKey(entityType, entityId, viewer.id)}
      loadPage={(page) => loadMoreEntityActivity(entityType, entityId, page)}
      initialItems={initialItems}
      initialHasMore={initialHasMore}
      viewer={viewer}
      actingEntity={actingEntity}
      canRemove={actingAsSelf}
    />
  );
}
