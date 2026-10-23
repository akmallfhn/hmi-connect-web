import PageMargin from "@/components/common/PageMargin";
import BottomNav from "@/components/navigations/BottomNav";
import Header from "@/components/navigations/Header";
import SearchResultsSkeleton from "@/components/search/SearchResultsSkeleton";
import { Bar } from "@/components/states/Skeleton";

export default function PeopleRecommendationLoading() {
  return (
    <div className="min-h-screen bg-surface pb-16 lg:pb-0">
      <Header loading mobileBackTitle="Mungkin Kamu Kenal" />

      <PageMargin noMobilePadding className="pb-6 lg:pt-6">
        <main className="mx-auto min-w-0 max-w-3xl">
          <Bar className="mx-3 mb-5 hidden h-7 w-52 lg:block" />
          <SearchResultsSkeleton category="user" />
        </main>
      </PageMargin>

      <BottomNav />
    </div>
  );
}
