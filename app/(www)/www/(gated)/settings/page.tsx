import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import { getUserByUsername } from "@/apis/users";
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
  const profile = user?.username
    ? await getUserByUsername(user.username, sessionToken)
    : null;

  return (
    <SettingsPage
      fullName={user?.full_name}
      avatar={user?.avatar}
      email={profile?.email}
      userId={user?.id}
      username={user?.username}
      verificationStatus={user?.verification_status}
      hasPassword={user?.has_password}
      createdAt={profile?.created_at}
      registrationNumber={profile?.registration_number}
      provinceName={profile?.province_name}
    />
  );
}
