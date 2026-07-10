import type { Metadata } from "next";
import MembershipPage from "@/components/pages/MembershipPage";
import { getSession } from "@/apis/session";
import { getMembershipDetail } from "@/apis/users";

export const metadata: Metadata = {
  title: "E-KTA",
  description: "Kartu Tanda Anggota digital kamu di HMI Connect.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Membership() {
  const { sessionToken, user } = await getSession();
  const membership = sessionToken ? await getMembershipDetail(sessionToken) : null;

  return (
    <MembershipPage
      fullName={user?.full_name}
      avatar={user?.avatar}
      userId={user?.id}
      username={user?.username}
      isVerified={user?.is_verified}
      membership={membership}
    />
  );
}
