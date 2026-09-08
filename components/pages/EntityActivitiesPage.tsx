"use client";

import { useCallback } from "react";
import type { ActivityEntry } from "@/apis/feeds";
import type { SessionUser } from "@/apis/session";
import { loadMoreEntityActivity } from "@/lib/actions";
import type { AccessEntityTypeEnum } from "@/lib/types";
import PageMargin from "../common/PageMargin";
import EntitySummarySidebar from "../entity/EntitySummarySidebar";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import ActivityInfiniteList from "../profile/ActivityInfiniteList";

export interface EntityActivitiesSummary {
  name: string;
  imageUrl: string | null;
  href: string;
}

interface EntityActivitiesPageProps {
  entityType: AccessEntityTypeEnum;
  entityId: string;
  entity: EntityActivitiesSummary;
  initialItems: ActivityEntry[];
  initialHasMore: boolean;
  viewer: SessionUser | null;
}

export default function EntityActivitiesPage({
  entityType,
  entityId,
  entity,
  initialItems,
  initialHasMore,
  viewer,
}: EntityActivitiesPageProps) {
  const loadMore = useCallback(
    (page: number) => loadMoreEntityActivity(entityType, entityId, page),
    [entityId, entityType],
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header
        fullName={viewer?.full_name}
        avatar={viewer?.avatar}
        userId={viewer?.id}
        username={viewer?.username}
        verificationStatus={viewer?.verification_status}
        mobileBackTitle={entity.name}
      />

      <PageMargin noMobilePadding className="pb-6 lg:pt-6">
        <div className="mx-auto grid grid-cols-1 gap-1.5 lg:max-w-[900px] lg:grid-cols-[280px_minmax(0,600px)] lg:gap-4">
          <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
            <EntitySummarySidebar
              name={entity.name}
              imageUrl={entity.imageUrl}
              href={entity.href}
            />
          </aside>

          <main className="min-w-0">
            <div className="border border-x-0 border-[#e6e9ef] bg-white p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
              <ActivityInfiniteList
                initialItems={initialItems}
                initialHasMore={initialHasMore}
                loadMore={loadMore}
                emptyMessage="Belum ada postingan."
              />
            </div>
          </main>
        </div>
      </PageMargin>

      <BottomNav userId={viewer?.id} username={viewer?.username} />
    </div>
  );
}
