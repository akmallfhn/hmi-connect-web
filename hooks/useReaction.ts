"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { REACTIONS } from "@/components/modals/ReactionPickerModal";
import { sendReaction, unsendReaction } from "@/lib/actions";
import { isSuccessStatus, type ReactionTargetTypeEnum, type ReactionTypeEnum } from "@/lib/types";

type ReactionBreakdown = Partial<Record<ReactionTypeEnum, number>>;

function adjustBreakdown(
  breakdown: ReactionBreakdown,
  type: ReactionTypeEnum,
  delta: number
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

interface UseReactionInitial {
  myReaction: ReactionTypeEnum | null;
  total: number;
  byType?: ReactionBreakdown;
}

export function useReaction(
  targetType: ReactionTargetTypeEnum,
  targetId: string,
  initial: UseReactionInitial
) {
  const [activeReaction, setActiveReaction] = useState<ReactionTypeEnum | null>(
    initial.myReaction
  );
  const [reactionCount, setReactionCount] = useState(initial.total);
  const [reactionBreakdown, setReactionBreakdown] = useState<ReactionBreakdown>(
    initial.byType ?? {}
  );
  const [reacting, startTransition] = useTransition();

  const activeReactionInfo = activeReaction
    ? REACTIONS.find((reaction) => reaction.type === activeReaction)
    : undefined;
  const reactionEmojis = Object.entries(reactionBreakdown)
    .filter(([, count]) => (count ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .map(([type]) => REACTIONS.find((reaction) => reaction.type === type)?.emoji)
    .filter((emoji): emoji is string => Boolean(emoji));

  function apply(nextType: ReactionTypeEnum | null) {
    const previousType = activeReaction;
    if (nextType === previousType) return;

    setActiveReaction(nextType);
    setReactionCount((prev) => {
      if (previousType === null && nextType !== null) return prev + 1;
      if (previousType !== null && nextType === null) return Math.max(0, prev - 1);
      return prev;
    });
    setReactionBreakdown((prev) => {
      let next = prev;
      if (previousType) next = adjustBreakdown(next, previousType, -1);
      if (nextType) next = adjustBreakdown(next, nextType, 1);
      return next;
    });

    startTransition(async () => {
      const result = nextType
        ? await sendReaction(targetType, targetId, nextType)
        : await unsendReaction(targetType, targetId);

      if (!isSuccessStatus(result.status)) {
        setActiveReaction(previousType);
        setReactionCount((prev) => {
          if (previousType === null && nextType !== null) return Math.max(0, prev - 1);
          if (previousType !== null && nextType === null) return prev + 1;
          return prev;
        });
        setReactionBreakdown((prev) => {
          let next = prev;
          if (nextType) next = adjustBreakdown(next, nextType, -1);
          if (previousType) next = adjustBreakdown(next, previousType, 1);
          return next;
        });
        toast.error(result.message ?? "Gagal memperbarui reaksi.");
      }
    });
  }

  return { activeReaction, activeReactionInfo, reactionCount, reactionEmojis, reacting, apply };
}
