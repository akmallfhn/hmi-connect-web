import type { Metadata } from "next";
import NotificationsPage from "@/components/pages/NotificationsPage";
import { getSession } from "@/apis/session";
import { getUserByUsername, listEducationHistories } from "@/apis/users";
import { listNotifications } from "@/apis/notifications";

export const metadata: Metadata = {
  title: "Notifikasi",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Notifications() {
  const { sessionToken, user } = await getSession();

  const [notifications, profile, educationHistories] = user?.username
    ? await Promise.all([
        listNotifications({ page: 1, pageSize: 20 }),
        getUserByUsername(user.username, sessionToken),
        listEducationHistories(user.username),
      ])
    : [
        await listNotifications({ page: 1, pageSize: 20 }),
        null,
        { list: [], hasMore: false },
      ];

  return (
    <NotificationsPage
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        isVerified: user?.is_verified,
      }}
      initialItems={notifications.list}
      initialHasMore={notifications.hasMore}
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
