"use client";

import type { InstitutionMember } from "@/apis/institutions";
import { loadMoreInstitutionMembers } from "@/lib/actions";
import { DEGREE_LABELS } from "@/lib/education";
import FollowCardGrid from "../feeds/FollowCardGrid";

interface InstitutionMemberGridProps {
  institutionId: number;
  viewerId?: string;
  initialItems: InstitutionMember[];
  initialHasMore: boolean;
}

// The member's education here stands in for the recommendation subtitle: "Sarjana Hukum · 2019 – 2023".
function memberSubtitle(member: InstitutionMember): string {
  const study = [DEGREE_LABELS[member.degree], member.major].filter(Boolean).join(" ");
  return `${study} · ${member.start_year} – ${member.end_year ?? "Sekarang"}`;
}

export default function InstitutionMemberGrid({
  institutionId,
  viewerId,
  initialItems,
  initialHasMore,
}: InstitutionMemberGridProps) {
  return (
    <FollowCardGrid
      queryKey={["institution-members", institutionId, viewerId]}
      loadPage={(page) => loadMoreInstitutionMembers(institutionId, page)}
      initialItems={initialItems}
      initialHasMore={initialHasMore}
      viewerId={viewerId}
      subtitle={memberSubtitle}
      emptyMessage="Belum ada kader yang mencantumkan institusi ini di riwayat pendidikannya."
    />
  );
}
