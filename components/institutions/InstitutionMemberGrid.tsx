"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { InstitutionMember } from "@/apis/institutions";
import { loadMoreInstitutionMembers } from "@/lib/actions";
import { DEGREE_LABELS } from "@/lib/education";
import FollowRecommendationRow from "../feeds/FollowRecommendationRow";

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
  const query = useInfiniteQuery({
    queryKey: ["institution-members", institutionId, viewerId],
    queryFn: ({ pageParam }) => loadMoreInstitutionMembers(institutionId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    initialData: {
      pages: [{ list: initialItems, hasMore: initialHasMore, totalData: 0 }],
      pageParams: [1],
    },
  });
  const { fetchNextPage, hasNextPage, isFetching } = query;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const members = useMemo(() => {
    const seen = new Set<string>();
    return (
      query.data?.pages.flatMap((page) =>
        page.list.filter((member) => {
          if (seen.has(member.id)) return false;
          seen.add(member.id);
          return true;
        }),
      ) ?? []
    );
  }, [query.data]);

  const loadNextPage = useCallback(async () => {
    if (hasNextPage && !isFetching) await fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetching]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadNextPage();
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, loadNextPage]);

  if (members.length === 0) {
    return (
      <p className="px-5 py-10 text-center text-sm text-muted-foreground">
        Belum ada kader yang mencantumkan institusi ini di riwayat pendidikannya.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {members.map((member) => (
          <FollowRecommendationRow
            key={member.id}
            connection={member}
            variant="card"
            subtitle={memberSubtitle(member)}
            initialFollowing={member.is_followed_by_me}
            hideFollow={!viewerId || member.id === viewerId}
          />
        ))}
      </div>

      {hasNextPage && <div ref={sentinelRef} className="h-12" />}
      {query.isFetchingNextPage && (
        <p className="py-4 text-center text-xs text-muted-foreground">
          Memuat...
        </p>
      )}
    </>
  );
}
