"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  conversationsQueryOptions,
  uniqueActivityItems,
} from "@/lib/activity-query";

export function useUnreadChatCount(userId: string | undefined): number {
  const query = useInfiniteQuery(conversationsQueryOptions(userId));
  return uniqueActivityItems(query.data).filter(
    (conversation) => conversation.unread,
  ).length;
}
