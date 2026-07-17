import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import {
  CardSkeleton,
  ComposerSkeleton,
  FeedItemSkeleton,
  ProfileMiniCardSkeleton,
} from "@/components/states/Skeleton";

export default function GatedHomeLoading() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header loading />

      <PageMargin
        noMobilePadding
        className="grid animate-pulse grid-cols-1 gap-1.5 pb-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-4 lg:pt-6 xl:grid-cols-[280px_minmax(0,1fr)_280px]"
      >
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
          <div className="flex flex-col gap-4">
            <ProfileMiniCardSkeleton />
            <div className="xl:hidden">
              <CardSkeleton />
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="flex flex-col gap-1.5 lg:gap-4">
            <ComposerSkeleton />
            {Array.from({ length: 6 }).map((_, index) => (
              <FeedItemSkeleton key={index} />
            ))}
          </div>
        </main>

        <aside className="hidden xl:sticky xl:top-20 xl:block xl:self-start">
          <CardSkeleton />
        </aside>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
