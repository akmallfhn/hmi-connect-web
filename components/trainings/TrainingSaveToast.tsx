"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function TrainingSaveToast({ kind }: { kind?: "created" | "updated" }) {
  const shown = useRef(false);
  useEffect(() => {
    if (!kind || shown.current) return;
    shown.current = true;
    toast.success(kind === "created" ? "Training berhasil dibuat." : "Training berhasil diperbarui.");
    const url = new URL(window.location.href);
    url.searchParams.delete("saved");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, [kind]);
  return null;
}
