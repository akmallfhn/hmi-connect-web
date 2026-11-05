"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function EventSaveToast({ kind }: { kind?: "created" | "updated" }) {
  const shown = useRef(false);
  useEffect(() => {
    if (!kind || shown.current) return;
    shown.current = true;
    toast.success(kind === "created" ? "Event berhasil diterbitkan." : "Perubahan event tersimpan.");
    const url = new URL(window.location.href);
    url.searchParams.delete("saved");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, [kind]);
  return null;
}
