import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import { ActivityRowSkeleton, ProfileMiniCardSkeleton } from "@/components/states/Skeleton";

export default function ProfileActivitiesLoading() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header loading />

      <PageMargin noMobilePadding className="animate-pulse pb-6 lg:pt-6">
        <div className="mx-auto grid grid-cols-1 gap-1.5 lg:max-w-[900px] lg:grid-cols-[280px_minmax(0,600px)] lg:gap-4">
          <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
            <ProfileMiniCardSkeleton />
          </aside>

          <main className="min-w-0">
            <div className="border border-x-0 border-[#e6e9ef] bg-[#eef1f5] p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
              <div className="flex flex-col gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ActivityRowSkeleton key={index} />
                ))}
              </div>
            </div>
          </main>
        </div>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
