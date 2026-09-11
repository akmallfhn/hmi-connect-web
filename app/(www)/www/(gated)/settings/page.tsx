import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import { getUserByUsername, listEducationHistories } from "@/apis/users";
import SettingsPage from "@/components/pages/SettingsPage";

export const metadata: Metadata = {
  title: "Pengaturan & Admin",
  description: "Kelola akun kamu di HMI Connect.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Settings() {
  const { sessionToken, user } = await getSession();
  // check-session carries no email/headline/counts, and the sidebar needs all of them.
  const [profile, education] = await Promise.all([
    user?.username
      ? getUserByUsername(user.username, sessionToken)
      : Promise.resolve(null),
    user?.username
      ? listEducationHistories(user.username)
      : Promise.resolve({ list: [] }),
  ]);

  return (
    <SettingsPage
      fullName={user?.full_name}
      avatar={user?.avatar}
      email={profile?.email}
      userId={user?.id}
      username={user?.username}
      verificationStatus={user?.verification_status}
      headline={profile?.headline}
      followingCount={profile?.following_count}
      followersCount={profile?.followers_count}
      educationHistories={education.list}
    />
  );
}
