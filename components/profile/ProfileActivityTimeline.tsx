"use client";

import { useCallback } from "react";
import type { ActivityEntry } from "@/apis/feeds";
import { loadMoreUserActivity } from "@/lib/actions";
import ActivityInfiniteList from "./ActivityInfiniteList";

interface ProfileActivityTimelineProps {
  username: string;
  owner: { name: string; avatar?: string };
  initialItems: ActivityEntry[];
  initialHasMore: boolean;
  isSignedIn: boolean;
}

export default function ProfileActivityTimeline({
  username,
  owner,
  initialItems,
  initialHasMore,
  isSignedIn,
}: ProfileActivityTimelineProps) {
  const loadMore = useCallback(
    (page: number) => loadMoreUserActivity(username, page),
    [username],
  );

  return (
    <ActivityInfiniteList
      initialItems={initialItems}
      initialHasMore={initialHasMore}
      loadMore={loadMore}
      emptyMessage="Belum ada aktivitas."
      itemVariant="card"
      owner={owner}
      isSignedIn={isSignedIn}
    />
  );
}
