import type { Metadata } from "next";
import NotificationsPage from "@/components/pages/NotificationsPage";
import { getSession } from "@/apis/session";
import { listNotifications } from "@/apis/notifications";

export const metadata: Metadata = {
  title: "Notifikasi",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Notifications() {
  const { user } = await getSession();
  const notifications = await listNotifications({ page: 1, pageSize: 20 });

  return (
    <NotificationsPage
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        verificationStatus: user?.verification_status,
      }}
      initialItems={notifications.list}
      initialHasMore={notifications.hasMore}
    />
  );
}
