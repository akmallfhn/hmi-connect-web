import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type {
  AccessEntityTypeEnum,
  ReactionTargetTypeEnum,
  ReactionTypeEnum,
} from "@/lib/types";

export type ReactionBreakdown = Partial<Record<ReactionTypeEnum, number>>;

export type ReactionState = {
  activeReaction: ReactionTypeEnum | null;
  total: number;
  byType: ReactionBreakdown;
};

type ReactionActor = {
  type: AccessEntityTypeEnum;
  id: string;
};

export const reactionKeys = {
  all: ["reaction-state"] as const,
  state: (
    viewerId: string | undefined,
    actor: ReactionActor | undefined,
    targetType: ReactionTargetTypeEnum,
    targetId: string,
  ) =>
    [
      ...reactionKeys.all,
      viewerId ?? "public",
      actor ? `entity:${actor.type}:${actor.id}` : `user:${viewerId ?? "public"}`,
      targetType,
      targetId,
    ] as const,
  mutation: (queryKey: QueryKey) => ["reaction-mutation", ...queryKey] as const,
};

export function createReactionState(
  initial: {
    myReaction: ReactionTypeEnum | null;
    total: number;
    byType?: ReactionBreakdown;
  },
  actingAsEntity = false,
): ReactionState {
  return {
    activeReaction: actingAsEntity ? null : initial.myReaction,
    total: initial.total,
    byType: initial.byType ?? {},
  };
}

function adjustBreakdown(
  breakdown: ReactionBreakdown,
  type: ReactionTypeEnum,
  delta: number,
): ReactionBreakdown {
  const nextCount = (breakdown[type] ?? 0) + delta;
  const next = { ...breakdown };
  if (nextCount <= 0) {
    delete next[type];
  } else {
    next[type] = nextCount;
  }
  return next;
}

export function applyReactionState(
  current: ReactionState,
  nextType: ReactionTypeEnum | null,
): ReactionState {
  const previousType = current.activeReaction;
  if (previousType === nextType) return current;

  let byType = current.byType;
  if (previousType) byType = adjustBreakdown(byType, previousType, -1);
  if (nextType) byType = adjustBreakdown(byType, nextType, 1);

  return {
    activeReaction: nextType,
    total:
      previousType === null && nextType !== null
        ? current.total + 1
        : previousType !== null && nextType === null
          ? Math.max(0, current.total - 1)
          : current.total,
    byType,
  };
}

export async function updateReactionInCache(
  client: QueryClient,
  queryKey: QueryKey,
  initial: ReactionState,
  nextType: ReactionTypeEnum | null,
) {
  await client.cancelQueries({ queryKey });
  const previous = client.getQueryData<ReactionState>(queryKey) ?? initial;
  const optimistic = applyReactionState(previous, nextType);
  client.setQueryData(queryKey, optimistic);
  return { previous, optimistic };
}

export function restoreReactionInCache(
  client: QueryClient,
  queryKey: QueryKey,
  context?: Awaited<ReturnType<typeof updateReactionInCache>>,
) {
  if (!context) return;
  client.setQueryData<ReactionState>(queryKey, (current) =>
    current === context.optimistic ? context.previous : current,
  );
}
