import PageMargin from "@/components/common/PageMargin";
import Header from "@/components/navigations/Header";
import BottomNav from "@/components/navigations/BottomNav";
import {
  ActivityListSkeleton,
  CardSkeleton,
  ProfileHeaderSkeleton,
  SectionCardSkeleton,
} from "@/components/states/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header loading />

      <PageMargin noMobilePadding className="animate-pulse pb-6 lg:py-6">
        <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-[minmax(0,768px)_320px] lg:gap-6">
          <div className="flex min-w-0 flex-col gap-1.5 lg:gap-4">
            <ProfileHeaderSkeleton />
            <SectionCardSkeleton titleWidth="w-16" rows={1} />
            <SectionCardSkeleton titleWidth="w-40" rows={2} />
            <SectionCardSkeleton titleWidth="w-24" rows={2} />
            <SectionCardSkeleton titleWidth="w-28" rows={2} />
            <ActivityListSkeleton />
          </div>

          <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
            <CardSkeleton />
          </aside>
        </div>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
