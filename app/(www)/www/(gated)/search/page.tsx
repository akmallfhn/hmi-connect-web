import type { Metadata } from "next";
import SearchPage from "@/components/pages/SearchPage";
import { getSession } from "@/apis/session";
import { searchPeople, searchPostings } from "@/apis/search";

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
  const [people, postings] = await Promise.all([
    searchPeople(keyword, { page: 1, pageSize: 20 }),
    searchPostings(keyword, { page: 1, pageSize: 20 }),
  ]);

  return (
    <SearchPage
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        verificationStatus: user?.verification_status,
      }}
      initialQuery={keyword}
      initialPeople={people}
      initialPostings={postings}
    />
  );
}
