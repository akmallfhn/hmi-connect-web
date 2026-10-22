"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Notification } from "@/apis/notifications";
import {
  activityKeys,
  readNotificationsInCache,
  restoreNotificationsInCache,
  type ActivityData,
} from "@/lib/activity-cache";
import { markNotificationsAsRead } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";

export function useNotificationRead(
  userId?: string,
  initial?: ActivityData<Notification>,
) {
  const client = useQueryClient();
  const queryKey = activityKeys.notifications(userId);
  const mutationKey = activityKeys.notificationRead(userId);
  return useMutation({
    mutationKey,
    mutationFn: async (ids: string[] | undefined) => {
      const result = await markNotificationsAsRead(ids);
      if (!isSuccessStatus(result.status))
        throw new Error(result.message || "Gagal menandai notifikasi dibaca.");
    },
    onMutate: (ids) => readNotificationsInCache(client, userId, ids, initial),
    onError: (error, _ids, context) => {
      restoreNotificationsInCache(client, userId, context);
      toast.error(error.message);
    },
    onSettled: () => {
      if (client.isMutating({ mutationKey }) === 1)
        void client.invalidateQueries({ queryKey });
    },
  });
}
