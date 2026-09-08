"use client";

import { useCallback } from "react";
import type { ActivityEntry } from "@/apis/feeds";
import type { EducationHistoryEntry } from "@/apis/users";
import { loadMoreUserActivity } from "@/lib/actions";
import type { VerificationStatusEnum } from "@/lib/types";
import PageMargin from "../common/PageMargin";
import ActivityInfiniteList from "../profile/ActivityInfiniteList";
import ProfileSidebar from "../feeds/ProfileSidebar";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";

interface ViewerProps {
  fullName?: string;
  avatar?: string;
  userId?: string;
  username?: string;
  verificationStatus?: VerificationStatusEnum;
}

interface ProfileSummary {
  userId: string;
  fullName: string;
  avatar?: string;
  headline?: string;
  verificationStatus: VerificationStatusEnum;
  followingCount: number;
  followersCount: number;
  educationHistories: EducationHistoryEntry[];
}

interface ProfileActivitiesPageProps {
  username: string;
  initialItems: ActivityEntry[];
  initialHasMore: boolean;
  profile: ProfileSummary;
  viewer: ViewerProps;
}

export default function ProfileActivitiesPage({
  username,
  initialItems,
  initialHasMore,
  profile,
  viewer,
}: ProfileActivitiesPageProps) {
  const loadMore = useCallback(
    (page: number) => loadMoreUserActivity(username, page),
    [username],
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        userId={viewer.userId}
        username={viewer.username}
        verificationStatus={viewer.verificationStatus}
      />

      <PageMargin noMobilePadding className="pb-6 lg:pt-6">
        <div className="mx-auto grid grid-cols-1 gap-1.5 lg:max-w-[900px] lg:grid-cols-[280px_minmax(0,600px)] lg:gap-4">
          <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
            <ProfileSidebar
              userId={profile.userId}
              fullName={profile.fullName}
              avatar={profile.avatar}
              headline={profile.headline}
              username={username}
              verificationStatus={profile.verificationStatus}
              followingCount={profile.followingCount}
              followersCount={profile.followersCount}
              educationHistories={profile.educationHistories}
            />
          </aside>

          <main className="min-w-0">
            <div className="border border-x-0 border-[#e6e9ef] bg-white p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
              <ActivityInfiniteList
                initialItems={initialItems}
                initialHasMore={initialHasMore}
                loadMore={loadMore}
                emptyMessage="Belum ada aktivitas."
              />
            </div>
          </main>
        </div>
      </PageMargin>

      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
