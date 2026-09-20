import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import { ActivityRowSkeleton } from "@/components/states/Skeleton";

export default function ProfileActivitiesLoading() {
  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <Header loading />

      <PageMargin noMobilePadding className="animate-pulse pb-6 lg:pt-6">
        <main className="min-w-0">
          <div className="border border-x-0 border-[#e6e9ef] bg-[#eef1f5] p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
            <div className="flex flex-col gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <ActivityRowSkeleton key={index} />
              ))}
            </div>
          </div>
        </main>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
