import type { Metadata } from "next";
import SearchPage from "@/components/pages/SearchPage";
import { getSession } from "@/apis/session";
import { getUserByUsername, listEducationHistories } from "@/apis/users";
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

  const { sessionToken, user } = await getSession();

  const [people, postings, profile, educationHistories] = user?.username
    ? await Promise.all([
        searchPeople(keyword, { page: 1, pageSize: 20 }),
        searchPostings(keyword, { page: 1, pageSize: 20 }),
        getUserByUsername(user.username, sessionToken),
        listEducationHistories(user.username),
      ])
    : [
        await searchPeople(keyword, { page: 1, pageSize: 20 }),
        await searchPostings(keyword, { page: 1, pageSize: 20 }),
        null,
        { list: [], hasMore: false },
      ];

  return (
    <SearchPage
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        isVerified: user?.is_verified,
      }}
      initialQuery={keyword}
      initialPeople={people}
      initialPostings={postings}
      profile={{
        userId: user?.id,
        fullName: user?.full_name,
        avatar: user?.avatar,
        headline: profile?.headline,
        isVerified: user?.is_verified,
        followingCount: profile?.following_count,
        followersCount: profile?.followers_count,
        educationHistories: educationHistories.list,
      }}
    />
  );
}
