"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveVerificationRequest,
  rejectVerificationRequest,
} from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import {
  verificationCountKey,
  verificationReviewKey as mutationKey,
  reviewVerificationInCache,
  restoreVerificationInCache,
} from "@/lib/verification-cache";

type Review = {
  id: string;
  branchId?: string;
  decision: "approved" | "rejected";
  reason?: string;
};

export function useVerificationReview() {
  const client = useQueryClient();
  return useMutation({
    mutationKey,
    mutationFn: async ({ id, decision, reason }: Review) => {
      const result =
        decision === "approved"
          ? await approveVerificationRequest(id)
          : await rejectVerificationRequest(id, reason ?? "");
      if (!isSuccessStatus(result.status))
        throw new Error(
          result.message || "Gagal meninjau permintaan verifikasi.",
        );
      return result;
    },
    onMutate: ({ branchId }) => reviewVerificationInCache(client, branchId),
    onError: (_error, _review, context) => {
      restoreVerificationInCache(client, context);
    },
    onSettled: () => {
      if (client.isMutating({ mutationKey }) === 1)
        void client.invalidateQueries({ queryKey: verificationCountKey });
    },
  });
}
