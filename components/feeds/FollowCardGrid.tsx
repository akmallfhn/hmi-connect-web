"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery, type QueryKey } from "@tanstack/react-query";
import FollowRecommendationRow, {
  type FollowRowConnection,
} from "./FollowRecommendationRow";

type FollowCardPerson = FollowRowConnection & { is_followed_by_me: boolean };

interface FollowCardGridProps<Person extends FollowCardPerson> {
  queryKey: QueryKey;
  loadPage: (page: number) => Promise<{ list: Person[]; hasMore: boolean }>;
  initialItems: Person[];
  initialHasMore: boolean;
  viewerId?: string;
  subtitle: (person: Person) => string;
  emptyMessage: string;
}

// An infinite grid of follow cards, shared by every "people of X" list.
export default function FollowCardGrid<Person extends FollowCardPerson>({
  queryKey,
  loadPage,
  initialItems,
  initialHasMore,
  viewerId,
  subtitle,
  emptyMessage,
}: FollowCardGridProps<Person>) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => loadPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    initialData: {
      pages: [{ list: initialItems, hasMore: initialHasMore }],
      pageParams: [1],
    },
  });
  const { fetchNextPage, hasNextPage, isFetching } = query;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const people = useMemo(() => {
    const seen = new Set<string>();
    return (
      query.data?.pages.flatMap((page) =>
        page.list.filter((person) => {
          if (seen.has(person.id)) return false;
          seen.add(person.id);
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

  if (people.length === 0) {
    return (
      <p className="px-5 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {people.map((person) => (
          <FollowRecommendationRow
            key={person.id}
            connection={person}
            variant="card"
            subtitle={subtitle(person)}
            initialFollowing={person.is_followed_by_me}
            hideFollow={!viewerId || person.id === viewerId}
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
