"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 30_000;

export type PendingVerificationScope = {
  organizationId?: string;
  branchId?: string;
};

// Layouts don't re-render on client navigation, so the server-seeded badge is refetched here.
export function usePendingVerificationCount(
  initialCount: number,
  scope: PendingVerificationScope,
  enabled = true,
): number {
  const pathname = usePathname();
  const [seenInitial, setSeenInitial] = useState(initialCount);
  const [count, setCount] = useState(initialCount);

  if (seenInitial !== initialCount) {
    setSeenInitial(initialCount);
    setCount(initialCount);
  }

  const { organizationId, branchId } = scope;

  useEffect(() => {
    if (!enabled) return;

    const params = new URLSearchParams();
    if (organizationId) params.set("organization_id", organizationId);
    else if (branchId) params.set("branch_id", branchId);
    const query = params.toString();
    const url = `/api/stat/verification-count${query ? `?${query}` : ""}`;
    let controller: AbortController | null = null;

    async function refetch() {
      if (document.visibilityState !== "visible") return;
      controller?.abort();
      const current = new AbortController();
      controller = current;
      try {
        const response = await fetch(url, { signal: current.signal, cache: "no-store" });
        if (!response.ok) return;
        const body = (await response.json()) as { data?: { pending_count?: number } | null };
        const next = body.data?.pending_count;
        if (typeof next === "number") setCount(next);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("[usePendingVerificationCount] refetch failed:", error);
        }
      }
    }

    refetch();
    const interval = window.setInterval(refetch, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", refetch);
    window.addEventListener("focus", refetch);
    return () => {
      controller?.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refetch);
      window.removeEventListener("focus", refetch);
    };
  }, [enabled, organizationId, branchId, pathname]);

  return count;
}
