import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import {
  ArticleCardSkeleton,
  ArticleRowSkeleton,
  Bar,
  CategoryPillsSkeleton,
} from "@/components/states/Skeleton";

export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header loading />

      <div className="sticky top-16 z-30 animate-pulse bg-[#eef1f5]">
        <PageMargin noMobilePadding className="pl-4 sm:hidden">
          <div className="flex items-center gap-2 overflow-x-auto py-3">
            <CategoryPillsSkeleton />
          </div>
        </PageMargin>
        <PageMargin className="hidden sm:flex sm:items-center sm:gap-4 sm:py-3">
          <Bar className="h-3.5 w-24 shrink-0" />
          <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
            <CategoryPillsSkeleton />
          </div>
        </PageMargin>
      </div>

      <PageMargin className="animate-pulse py-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="aspect-video w-full rounded-xl bg-[#e6e9ef] lg:w-1/2" />
            <div className="flex w-full flex-col gap-3 lg:w-1/2">
              <Bar className="h-5 w-full" />
              <Bar className="h-5 w-4/5" />
              <Bar className="h-3 w-full" />
              <Bar className="h-3 w-2/3" />
              <Bar className="h-2.5 w-1/3" />
            </div>
          </div>

          <div className="flex flex-col divide-y divide-[#e6e9ef] sm:hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <ArticleRowSkeleton key={index} />
            ))}
          </div>

          <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ArticleCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
