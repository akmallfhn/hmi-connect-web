"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  activityKeys,
  readConversationInCache,
  restoreConversationInCache,
} from "@/lib/activity-cache";
import { markMessagesAsRead } from "@/lib/actions";

export function useConversationRead(userId?: string) {
  const client = useQueryClient();
  const queryKey = activityKeys.conversations(userId);
  const mutationKey = activityKeys.conversationRead(userId);
  return useMutation({
    mutationKey,
    mutationFn: async (conversationId: string) => {
      const result = await markMessagesAsRead(conversationId);
      if (!result.ok) throw new Error("Gagal menandai pesan dibaca.");
    },
    onMutate: (conversationId) =>
      readConversationInCache(client, userId, conversationId),
    onError: (error, conversationId, context) => {
      restoreConversationInCache(client, userId, context);
      toast.error(error.message);
    },
    onSettled: () => {
      if (client.isMutating({ mutationKey }) === 1)
        void client.invalidateQueries({ queryKey });
    },
  });
}
