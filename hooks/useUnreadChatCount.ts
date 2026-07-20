"use client";

import { useCallback, useEffect, useState } from "react";
import { listConversations } from "@/lib/actions";
import { useRealtimeTopic } from "./useRealtimeTopic";

// Same independent-fetch-per-component shape as the notifications bell — used by
// BottomNav's Pesan tab so it doesn't need to sit under the /chats conversations context.
export function useUnreadChatCount(userId: string | undefined): number {
  const [count, setCount] = useState(0);

  const refetch = useCallback(() => {
    if (!userId) return;
    listConversations(1).then((result) => {
      setCount(result.list.filter((conversation) => conversation.unread).length);
    });
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useRealtimeTopic(userId ? `conversations:${userId}` : undefined, refetch);

  return count;
}
