"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  verificationCountKey,
  verificationReviewKey,
  type PendingVerificationScope,
} from "@/lib/verification-cache";

export function usePendingVerificationCount(
  initialCount: number,
  scope: PendingVerificationScope,
  enabled = true,
): number {
  const { organizationId, branchId } = scope;
  const client = useQueryClient();
  const pathname = usePathname();
  useEffect(() => {
    if (enabled && !client.isMutating({ mutationKey: verificationReviewKey })) {
      void client.invalidateQueries(
        {
          queryKey: [...verificationCountKey, { organizationId, branchId }],
        },
        { cancelRefetch: false },
      );
    }
  }, [client, enabled, organizationId, branchId, pathname]);
  const query = useQuery({
    queryKey: [...verificationCountKey, { organizationId, branchId }],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();
      if (organizationId) params.set("organization_id", organizationId);
      if (branchId) params.set("branch_id", branchId);
      const response = await fetch(`/api/stat/verification-count?${params}`, {
        signal,
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Jumlah verifikasi gagal dimuat.");
      const body = (await response.json()) as {
        data?: { pending_count?: number };
      };
      if (typeof body.data?.pending_count !== "number")
        throw new Error("Jumlah verifikasi tidak valid.");
      return body.data.pending_count;
    },
    initialData: initialCount,
    initialDataUpdatedAt: 0,
    staleTime: 0,
    enabled,
    refetchInterval: () =>
      client.isMutating({ mutationKey: verificationReviewKey })
        ? false
        : 30_000,
    refetchOnWindowFocus: () =>
      !client.isMutating({ mutationKey: verificationReviewKey }),
    refetchOnReconnect: () =>
      !client.isMutating({ mutationKey: verificationReviewKey }),
  });
  return query.data;
}
