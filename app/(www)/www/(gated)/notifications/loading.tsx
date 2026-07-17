import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import { ActivityListSkeleton, ProfileMiniCardSkeleton } from "@/components/states/Skeleton";

export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header loading />

      <PageMargin
        noMobilePadding
        className="animate-pulse pb-6 lg:pt-6"
      >
        <div className="mx-auto grid grid-cols-1 gap-1.5 lg:max-w-[900px] lg:grid-cols-[280px_minmax(0,600px)] lg:gap-4">
          <aside className="hidden lg:block">
            <ProfileMiniCardSkeleton />
          </aside>

          <div className="min-w-0">
            <ActivityListSkeleton rows={6} />
          </div>
        </div>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
