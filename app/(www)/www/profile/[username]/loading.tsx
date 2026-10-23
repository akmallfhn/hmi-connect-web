import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import {
  ActivityListSkeleton,
  CardSkeleton,
  ProfileHeaderSkeleton,
} from "@/components/states/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-surface pb-16 lg:pb-0">
      <Header loading />

      <PageMargin noMobilePadding className="animate-pulse pb-6 lg:py-6">
        <div className="grid grid-cols-1 gap-1.5 lg:items-start lg:grid-cols-[minmax(0,768px)_320px] lg:gap-6">
          <div className="flex min-w-0 flex-col gap-1.5 lg:gap-4">
            <ProfileHeaderSkeleton />
            <div className="px-4 lg:px-0">
              <div className="grid h-10 w-full grid-cols-4 gap-1 rounded-lg border border-border bg-surface-subtle p-1 sm:w-[412px]">
                <div className="rounded-lg bg-border" />
                <div className="rounded-lg bg-surface-muted" />
                <div className="rounded-lg bg-surface-muted" />
                <div className="rounded-lg bg-surface-muted" />
              </div>
            </div>
            <div className="mt-2.5">
              <ActivityListSkeleton />
            </div>
          </div>

          <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
            <CardSkeleton />
          </aside>
        </div>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
