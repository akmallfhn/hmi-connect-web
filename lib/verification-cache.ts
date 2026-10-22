import type { QueryClient } from "@tanstack/react-query";

export type PendingVerificationScope = {
  organizationId?: string;
  branchId?: string;
};
export const verificationCountKey = ["pending-verification-count"] as const;
export const verificationReviewKey = ["verification-review"] as const;

export async function reviewVerificationInCache(
  client: QueryClient,
  branchId?: string,
) {
  await client.cancelQueries({ queryKey: verificationCountKey });
  const affected = client
    .getQueriesData<number>({ queryKey: verificationCountKey })
    .filter(([key, count]) => {
      const scope = key[1] as PendingVerificationScope;
      return (
        count !== undefined &&
        count > 0 &&
        (!scope.branchId || scope.branchId === branchId)
      );
    });
  for (const [key] of affected)
    client.setQueryData<number>(key, (count) => Math.max(0, (count ?? 0) - 1));
  return affected;
}

export function restoreVerificationInCache(
  client: QueryClient,
  affected: Awaited<ReturnType<typeof reviewVerificationInCache>> = [],
) {
  for (const [key] of affected)
    client.setQueryData<number>(key, (count) => (count ?? 0) + 1);
}
