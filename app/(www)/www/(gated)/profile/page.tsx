import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import ProfilePage from "@/components/pages/ProfilePage";

export const metadata: Metadata = {
  title: "Profil Saya | HMI Connect",
};

export default async function Profile() {
  const { user } = await getSession();

  return (
    <ProfilePage
      fullName={user?.full_name}
      avatar={user?.avatar}
      roleName={user?.role_name}
      branchName={user?.branch_name}
      coordinatingBodyName={user?.coordinating_body_name}
      organizationName={user?.organization_name}
      isVerified={user?.is_verified}
      isSubscribe={user?.is_subscribe}
    />
  );
}
