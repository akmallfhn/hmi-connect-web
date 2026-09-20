import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import { Bar, NotificationListSkeleton } from "@/components/states/Skeleton";

export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <Header loading />

      <PageMargin noMobilePadding className="animate-pulse pb-6 lg:pt-6">
        <div className="min-w-0">
          <Bar className="mx-5 hidden h-9 w-44 lg:mx-0 lg:mb-5 lg:block" />
          <NotificationListSkeleton rows={6} />
        </div>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
