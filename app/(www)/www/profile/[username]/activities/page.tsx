import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/apis/session";
import {
  getUserByUsername,
  listEducationHistories,
  listTrainingHistories,
  listUserActivity,
} from "@/apis/users";
import ProfileActivitiesPage from "@/components/pages/ProfileActivitiesPage";

interface ActivitiesRouteProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: ActivitiesRouteProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getUserByUsername(username);
  const title = profile ? `Aktivitas ${profile.full_name}` : "Profil Tidak Ditemukan";

  return {
    title,
    alternates: { canonical: `/profile/${username}/activities` },
    robots: { index: false, follow: false },
  };
}

export default async function Activities({ params }: ActivitiesRouteProps) {
  const { username } = await params;
  const { sessionToken, user: viewer } = await getSession();
  const profile = await getUserByUsername(username, sessionToken);

  if (!profile || profile.status !== "active") return notFound();

  const [
    { list: activities, hasMore },
    { list: educationHistories },
    { list: trainingHistories },
  ] = await Promise.all([
    listUserActivity(username, { page: 1, pageSize: 20 }),
    listEducationHistories(username),
    listTrainingHistories(username),
  ]);

  return (
    <ProfileActivitiesPage
      username={username}
      initialItems={activities}
      initialHasMore={hasMore}
      profile={{
        fullName: profile.full_name,
        avatar: profile.avatar,
        headline: profile.headline,
        isVerified: profile.is_verified,
        followingCount: profile.following_count,
        followersCount: profile.followers_count,
        feedCount: profile.feed_count,
        educationHistories,
        trainingHistories,
      }}
      viewer={{
        fullName: viewer?.full_name,
        avatar: viewer?.avatar,
        userId: viewer?.id,
        username: viewer?.username,
        isVerified: viewer?.is_verified,
      }}
    />
  );
}
