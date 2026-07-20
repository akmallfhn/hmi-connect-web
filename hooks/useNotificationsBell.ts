"use client";

import { useCallback, useEffect, useState } from "react";
import type { Notification } from "@/apis/notifications";
import { listNotifications, markNotificationsAsRead } from "@/lib/actions";
import { useNotificationsRealtime } from "./useNotificationsRealtime";

// Shared bell state machine — fetch-on-mount + realtime refetch + optimistic read/mark-all,
// reused by every independent bell trigger (Header's desktop/mobile bell, MobileGreetingBar's)
// so the logic isn't triplicated, same idea as useReaction for feed/comment/reply reactions.
export function useNotificationsBell(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter((item) => !item.read_at).length;

  const refetch = useCallback(() => {
    listNotifications(1).then((result) => setNotifications(result.list));
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    listNotifications(1).then((result) => {
      if (!cancelled) setNotifications(result.list);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useNotificationsRealtime(userId, refetch);

  function handleRead(id: string) {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id && !item.read_at
          ? { ...item, read_at: new Date().toISOString() }
          : item
      )
    );
    markNotificationsAsRead([id]);
  }

  function handleMarkAllRead() {
    if (unreadCount === 0) return;
    setNotifications((prev) =>
      prev.map((item) =>
        item.read_at ? item : { ...item, read_at: new Date().toISOString() }
      )
    );
    markNotificationsAsRead();
  }

  return { notifications, unreadCount, handleRead, handleMarkAllRead };
}
