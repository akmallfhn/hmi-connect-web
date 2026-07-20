"use client";

import { useRealtimeTopic } from "./useRealtimeTopic";

// Broadcasts the raw notification row — callers should treat onChange as "refetch", not read the payload.
export function useNotificationsRealtime(
  userId: string | undefined,
  onChange: () => void
) {
  useRealtimeTopic(userId ? `notifications:${userId}` : undefined, onChange);
}
