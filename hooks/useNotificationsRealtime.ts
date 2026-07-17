"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

// Broadcasts the raw notification row — callers should treat onChange as "refetch", not read the payload.
export function useNotificationsRealtime(
  userId: string | undefined,
  onChange: () => void
) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!userId) return;

    const topic = `notifications:${userId}`;
    // private: true is required for the notifications RLS policy on realtime.messages to run — otherwise the join succeeds but nothing is ever delivered.
    const channel = supabase
      .channel(topic, { config: { private: true } })
      .on("broadcast", { event: "INSERT" }, () => onChangeRef.current())
      .on("broadcast", { event: "UPDATE" }, () => onChangeRef.current())
      .on("broadcast", { event: "DELETE" }, () => onChangeRef.current())
      .subscribe((status, err) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          console.error(`[useNotificationsRealtime] ${status}: ${topic}`, err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
}
