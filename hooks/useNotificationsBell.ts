"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  notificationsQueryOptions,
  uniqueActivityItems,
} from "@/lib/activity-query";
import { useNotificationRead } from "./useNotificationRead";

export function useNotificationsBell(userId?: string) {
  const query = useInfiniteQuery(notificationsQueryOptions(userId));
  const { mutate } = useNotificationRead(userId);
  const notifications = uniqueActivityItems(query.data);
  const unreadCount = notifications.filter((item) => !item.read_at).length;
  return {
    notifications,
    unreadCount,
    handleRead: (id: string) => mutate([id]),
    handleMarkAllRead: () => mutate(undefined),
  };
}
