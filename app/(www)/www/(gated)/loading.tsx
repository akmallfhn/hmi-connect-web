import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import {
  CardSkeleton,
  ComposerSkeleton,
  FeedItemSkeleton,
} from "@/components/states/Skeleton";

export default function GatedHomeLoading() {
  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <Header loading />

      <PageMargin
        noMobilePadding
        className="grid animate-pulse grid-cols-1 gap-1.5 pb-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:gap-8 lg:pt-6"
      >
        <main className="min-w-0">
          <div className="flex flex-col gap-1.5 lg:gap-4">
            <ComposerSkeleton />
            {Array.from({ length: 6 }).map((_, index) => (
              <FeedItemSkeleton key={index} />
            ))}
          </div>
        </main>

        <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
          <CardSkeleton />
        </aside>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
