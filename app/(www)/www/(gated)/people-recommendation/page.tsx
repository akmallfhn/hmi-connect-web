import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import { listFollowRecommendations } from "@/apis/users";
import PeopleRecommendationPage from "@/components/pages/PeopleRecommendationPage";

export const metadata: Metadata = {
  title: "Mungkin Kamu Kenal",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PeopleRecommendation() {
  const [{ user }, recommendations] = await Promise.all([
    getSession(),
    listFollowRecommendations({ page: 1, pageSize: 20 }),
  ]);

  return (
    <PeopleRecommendationPage
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        verificationStatus: user?.verification_status,
      }}
      initialItems={recommendations.list}
      initialHasMore={recommendations.hasMore}
    />
  );
}
