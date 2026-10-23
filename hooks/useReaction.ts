"use client";

import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { REACTIONS } from "@/components/modals/ReactionPickerModal";
import { sendReaction, unsendReaction } from "@/lib/actions";
import type { EntityAuthor } from "@/apis/feeds";
import {
  isSuccessStatus,
  type ReactionTargetTypeEnum,
  type ReactionTypeEnum,
} from "@/lib/types";
import {
  createReactionState,
  reactionKeys,
  restoreReactionInCache,
  updateReactionInCache,
  type ReactionBreakdown,
  type ReactionState,
} from "@/lib/reaction-cache";

interface UseReactionInitial {
  viewerId?: string;
  myReaction: ReactionTypeEnum | null;
  total: number;
  byType?: ReactionBreakdown;
  // A personal reaction and an entity reaction are distinct. The timeline's
  // `my_reaction` is personal, so it must not seed an official-account action.
  authorEntity?: EntityAuthor;
}

export function useReaction(
  targetType: ReactionTargetTypeEnum,
  targetId: string,
  initial: UseReactionInitial,
) {
  const client = useQueryClient();
  const queryKey = reactionKeys.state(
    initial.viewerId,
    initial.authorEntity,
    targetType,
    targetId,
  );
  const mutationKey = reactionKeys.mutation(queryKey);
  const initialState = createReactionState(
    initial,
    Boolean(initial.authorEntity),
  );
  const { data: state } = useQuery<ReactionState>({
    queryKey,
    enabled: false,
    initialData: initialState,
  });
  const mutation = useMutation({
    mutationKey,
    mutationFn: async (nextType: ReactionTypeEnum | null) => {
      const result = nextType
        ? await sendReaction(
            targetType,
            targetId,
            nextType,
            initial.authorEntity,
          )
        : await unsendReaction(targetType, targetId, initial.authorEntity);
      if (!isSuccessStatus(result.status)) {
        throw new Error(result.message ?? "Gagal memperbarui reaksi.");
      }
    },
    onMutate: (nextType) =>
      updateReactionInCache(client, queryKey, state, nextType),
    onError: (error, _nextType, context) => {
      restoreReactionInCache(client, queryKey, context);
      toast.error(error.message);
    },
  });
  const reacting = useIsMutating({ mutationKey }) > 0;
  const activeReaction = state.activeReaction;
  const reactionCount = state.total;
  const reactionBreakdown = state.byType;

  const activeReactionInfo = activeReaction
    ? REACTIONS.find((reaction) => reaction.type === activeReaction)
    : undefined;
  const reactionEmojis = Object.entries(reactionBreakdown)
    .filter(([, count]) => (count ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .map(([type]) => REACTIONS.find((reaction) => reaction.type === type)?.emoji)
    .filter((emoji): emoji is string => Boolean(emoji));

  function apply(nextType: ReactionTypeEnum | null) {
    if (reacting || nextType === activeReaction) return;
    mutation.mutate(nextType);
  }

  return {
    activeReaction,
    activeReactionInfo,
    reactionCount,
    reactionEmojis,
    reacting,
    apply,
  };
}
