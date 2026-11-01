"use client";

import type { EntityMember } from "@/apis/entity-follows";
import { loadMoreEntityMembers } from "@/lib/actions";
import { entityMembersQueryKey } from "@/lib/entity-profile";
import { formatEntityAuthorName } from "@/lib/feed-author";
import type { AccessEntityTypeEnum } from "@/lib/types";
import FollowCardGrid from "../feeds/FollowCardGrid";

interface EntityMemberGridProps {
  entityType: AccessEntityTypeEnum;
  entityId: string;
  viewerId?: string;
  initialItems: EntityMember[];
  initialHasMore: boolean;
}

// A kader introduces themselves by headline first, then by the unit they belong to.
function memberSubtitle(member: EntityMember): string {
  const headline = member.headline?.trim();
  if (headline) return headline;
  if (member.chapter_name) return formatEntityAuthorName("chapter", member.chapter_name);
  if (member.branch_name) return formatEntityAuthorName("branch", member.branch_name);
  return "Kader HMI";
}

export default function EntityMemberGrid({
  entityType,
  entityId,
  viewerId,
  initialItems,
  initialHasMore,
}: EntityMemberGridProps) {
  return (
    <FollowCardGrid
      queryKey={entityMembersQueryKey(entityType, entityId, viewerId)}
      loadPage={(page) => loadMoreEntityMembers(entityType, entityId, page)}
      initialItems={initialItems}
      initialHasMore={initialHasMore}
      viewerId={viewerId}
      subtitle={memberSubtitle}
      emptyMessage="Belum ada kader yang terdaftar."
    />
  );
}
