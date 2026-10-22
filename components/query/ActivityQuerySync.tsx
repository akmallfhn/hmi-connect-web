"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useNotificationsRealtime } from "@/hooks/useNotificationsRealtime";
import { useRealtimeTopic } from "@/hooks/useRealtimeTopic";
import { activityKeys } from "@/lib/activity-query";

export default function ActivityQuerySync({ userId }: { userId?: string }) {
  const client = useQueryClient();
  useNotificationsRealtime(userId, () => {
    if (
      !client.isMutating({ mutationKey: activityKeys.notificationRead(userId) })
    ) {
      void client.invalidateQueries({
        queryKey: activityKeys.notifications(userId),
      });
    }
  });
  useRealtimeTopic(userId ? `conversations:${userId}` : undefined, () => {
    if (
      !client.isMutating({ mutationKey: activityKeys.conversationRead(userId) })
    ) {
      void client.invalidateQueries({
        queryKey: activityKeys.conversations(userId),
      });
    }
  });
  return null;
}
