"use client";

import { useCallback } from "react";
import type { ActivityEntry } from "@/apis/feeds";
import { loadMoreUserActivity } from "@/lib/actions";
import type { VerificationStatusEnum } from "@/lib/types";
import PageMargin from "../common/PageMargin";
import ActivityInfiniteList from "../profile/ActivityInfiniteList";
import type { ComposerAuthorEntity } from "../forms/CreateFeedForms";
import ActingAwareBottomNav from "../official/ActingAwareBottomNav";
import { ActingEntityProvider } from "@/hooks/useActingEntity";
import Header from "../navigations/Header";

interface ViewerProps {
  fullName?: string;
  avatar?: string;
  userId?: string;
  username?: string;
  verificationStatus?: VerificationStatusEnum;
}

interface ProfileActivitiesPageProps {
  username: string;
  initialItems: ActivityEntry[];
  initialHasMore: boolean;
  viewer: ViewerProps;
  actingEntity?: ComposerAuthorEntity | null;
}

export default function ProfileActivitiesPage({
  username,
  initialItems,
  initialHasMore,
  viewer,
  actingEntity,
}: ProfileActivitiesPageProps) {
  const loadMore = useCallback(
    (page: number) => loadMoreUserActivity(username, page),
    [username],
  );

  return (
    <ActingEntityProvider entity={actingEntity ?? null}>
      <div className="min-h-screen bg-white pb-16 lg:pb-0">
        <Header
          fullName={viewer.fullName}
          avatar={viewer.avatar}
          userId={viewer.userId}
          username={viewer.username}
          verificationStatus={viewer.verificationStatus}
        />

        <PageMargin noMobilePadding className="pb-6 lg:pt-6">
          <main className="min-w-0">
            <div className="border border-x-0 border-[#e6e9ef] bg-white p-5 lg:rounded-2xl lg:border-x">
              <ActivityInfiniteList
                initialItems={initialItems}
                initialHasMore={initialHasMore}
                loadMore={loadMore}
                emptyMessage="Belum ada aktivitas."
              />
            </div>
          </main>
        </PageMargin>

        <ActingAwareBottomNav
          actingEntity={actingEntity}
          userId={viewer.userId}
          username={viewer.username}
        />
      </div>
    </ActingEntityProvider>
  );
}
