import type { Metadata } from "next";
import SearchPage from "@/components/pages/SearchPage";
import { getSession } from "@/apis/session";
import { searchOverview } from "@/apis/search";
import { Suspense } from "react";
import SuggestedConnectionsCard from "@/components/feeds/SuggestedConnectionsCard";
import { resolveActingEntity } from "@/lib/acting-entity";

export const metadata: Metadata = {
  title: "Cari",
  robots: {
    index: false,
    follow: false,
  },
};

interface SearchRouteProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function Search({ searchParams }: SearchRouteProps) {
  const { q } = await searchParams;
  const keyword = q?.trim() ?? "";

  const { user } = await getSession();
  const [results, actingEntity] = await Promise.all([
    searchOverview(keyword),
    resolveActingEntity(user),
  ]);

  return (
    <SearchPage
      key={keyword}
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        userStatus: user?.status,
        verificationStatus: user?.verification_status,
      }}
      initialQuery={keyword}
      initialResults={results}
      actingEntity={actingEntity}
      aside={
        actingEntity ? null : (
          <Suspense fallback={null}>
            <SuggestedConnectionsCard />
          </Suspense>
        )
      }
    />
  );
}
