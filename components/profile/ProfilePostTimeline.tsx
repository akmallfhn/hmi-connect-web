"use client";

import type { FeedTimelineItem } from "@/apis/feeds";
import type { ComposerAuthorEntity } from "@/components/forms/CreateFeedForms";
import { loadMoreUserFeeds } from "@/lib/actions";
import FeedPostTimeline, {
  type PostTimelineViewer,
} from "../feeds/FeedPostTimeline";

interface ProfilePostTimelineProps {
  username: string;
  profileUserId?: string;
  initialItems: FeedTimelineItem[];
  initialHasMore: boolean;
  viewer: PostTimelineViewer;
  actingEntity?: ComposerAuthorEntity | null;
}

export default function ProfilePostTimeline({
  username,
  profileUserId,
  initialItems,
  initialHasMore,
  viewer,
  actingEntity,
}: ProfilePostTimelineProps) {
  return (
    <FeedPostTimeline
      queryKey={["profile-posts", viewer.id ?? "public", username]}
      loadPage={(page) => loadMoreUserFeeds(username, page)}
      initialItems={initialItems}
      initialHasMore={initialHasMore}
      viewer={viewer}
      actingEntity={actingEntity}
      canRemove={viewer.id === profileUserId && !actingEntity}
    />
  );
}
