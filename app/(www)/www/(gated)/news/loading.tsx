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
      <Header
        loading
        mobileBackTitle="HMI News"
        desktopFilterBar={
          <>
            <Bar className="h-4 w-24 shrink-0" />
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
              <CategoryPillsSkeleton />
            </div>
          </>
        }
      />

      <div className="border-b border-[#e6e9ef] lg:hidden">
        <PageMargin className="flex animate-pulse items-center gap-2 overflow-x-auto py-3">
          <CategoryPillsSkeleton />
        </PageMargin>
      </div>

      <PageMargin className="animate-pulse py-6">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col divide-y divide-[#e6e9ef] lg:hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <ArticleRowSkeleton key={index} />
            ))}
          </div>

          <div className="hidden flex-col gap-10 lg:flex">
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="flex flex-col gap-3">
                <div className="aspect-[16/9] w-full rounded-2xl bg-[#e6e9ef]" />
                <Bar className="h-2.5 w-24" />
                <Bar className="h-5 w-full" />
                <Bar className="h-5 w-4/5" />
                <Bar className="h-3 w-2/3" />
              </div>
              <div className="flex flex-col divide-y divide-[#e6e9ef]">
                {Array.from({ length: 3 }).map((_, index) => (
                  <ArticleRowSkeleton key={index} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <ArticleCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
