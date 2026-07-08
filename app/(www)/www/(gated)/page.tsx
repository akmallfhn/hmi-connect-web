import FeedPage from "@/components/pages/FeedPage";
import { getSession } from "@/apis/session";
import {
  getUserById,
  listEducationHistories,
  listTrainingHistories,
} from "@/apis/users";

export default async function HomePage() {
  const { user } = await getSession();

  const [profile, educationHistories, trainingHistories] = user?.id
    ? await Promise.all([
        getUserById(user.id),
        listEducationHistories(user.id),
        listTrainingHistories(user.id),
      ])
    : [null, { list: [], hasMore: false }, { list: [], hasMore: false }];

  return (
    <FeedPage
      fullName={user?.full_name}
      avatar={user?.avatar}
      email={profile?.email}
      headline={profile?.headline}
      userId={user?.id}
      isVerified={user?.is_verified}
      followingCount={profile?.following_count}
      followersCount={profile?.followers_count}
      feedCount={profile?.feed_count}
      educationHistories={educationHistories.list}
      trainingHistories={trainingHistories.list}
    />
  );
}
