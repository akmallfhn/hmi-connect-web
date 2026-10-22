import { infiniteQueryOptions } from "@tanstack/react-query";
import type { Notification } from "@/apis/notifications";
import { listConversations, listNotifications } from "@/lib/actions";

import { activityKeys, type ActivityPage } from "./activity-cache";
export {
  activityKeys,
  mapActivity,
  uniqueActivityItems,
  type ActivityData,
  type ActivityPage,
  type ConversationsData,
} from "./activity-cache";

export function notificationsQueryOptions(
  userId?: string,
  initial?: ActivityPage<Notification>,
) {
  return infiniteQueryOptions({
    queryKey: activityKeys.notifications(userId),
    queryFn: async ({ pageParam }) => {
      const result = await listNotifications(pageParam);
      if (!result.ok) throw new Error("Gagal memuat notifikasi.");
      return { list: result.list, hasMore: result.hasMore };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    enabled: Boolean(userId),
    initialData: initial ? { pages: [initial], pageParams: [1] } : undefined,
  });
}

export function conversationsQueryOptions(userId?: string) {
  return infiniteQueryOptions({
    queryKey: activityKeys.conversations(userId),
    queryFn: async ({ pageParam }) => {
      const result = await listConversations(pageParam);
      if (!result.ok) throw new Error("Gagal memuat percakapan.");
      return { list: result.list, hasMore: result.hasMore };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    enabled: Boolean(userId),
  });
}
