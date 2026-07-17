"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

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

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on("broadcast", { event: "INSERT" }, () => onChangeRef.current())
      .on("broadcast", { event: "UPDATE" }, () => onChangeRef.current())
      .on("broadcast", { event: "DELETE" }, () => onChangeRef.current())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
}
