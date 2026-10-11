import type { Metadata } from "next";
import SearchPage from "@/components/pages/SearchPage";
import { getSession } from "@/apis/session";
import { SEARCH_CATEGORIES, searchOverview, type SearchCategory } from "@/apis/search";
import { Suspense } from "react";
import SuggestedConnectionsCard from "@/components/feeds/SuggestedConnectionsCard";

export const metadata: Metadata = {
  title: "Cari",
  robots: {
    index: false,
    follow: false,
  },
};

interface SearchRouteProps {
  searchParams: Promise<{ q?: string; tab?: string }>;
}

export default async function Search({ searchParams }: SearchRouteProps) {
  const { q, tab } = await searchParams;
  const keyword = q?.trim() ?? "";
  const category: SearchCategory = SEARCH_CATEGORIES.includes(tab as SearchCategory)
    ? (tab as SearchCategory)
    : "user";

  const { user } = await getSession();
  const { results, counts } = await searchOverview(category, keyword);

  return (
    <SearchPage
      key={`${category}:${keyword}`}
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        userStatus: user?.status,
        verificationStatus: user?.verification_status,
      }}
      initialQuery={keyword}
      activeCategory={category}
      initialResults={results}
      initialCounts={counts}
      aside={
        <Suspense fallback={null}>
          <SuggestedConnectionsCard />
        </Suspense>
      }
    />
  );
}
