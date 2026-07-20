"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

// Generic Supabase Realtime Broadcast subscription — the same "subscribe to a private
// topic, call back on any INSERT/UPDATE/DELETE" shape used by notifications and chat,
// factored out so both can share it instead of each re-wiring the channel by hand.
// Callers should treat onChange as "something changed, refetch" — the broadcast payload
// is a raw row, not the enriched view a list endpoint returns.
export function useRealtimeTopic(topic: string | undefined, onChange: () => void) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!topic) return;

    // private: true is required for the RLS policy on realtime.messages to run — otherwise
    // the join succeeds but database-originated broadcasts are silently never delivered.
    const channel = supabase
      .channel(topic, { config: { private: true } })
      .on("broadcast", { event: "INSERT" }, () => onChangeRef.current())
      .on("broadcast", { event: "UPDATE" }, () => onChangeRef.current())
      .on("broadcast", { event: "DELETE" }, () => onChangeRef.current())
      .subscribe((status, err) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          console.error(`[useRealtimeTopic] ${status}: ${topic}`, err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [topic]);
}
