import type { Metadata } from "next";
import { redirect } from "next/navigation";
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

  const verificationStatus = user?.verification_status;
  // A review in progress still gets the page, just locked — /verification would only bounce them back to /.
  if (verificationStatus !== "verified" && verificationStatus !== "pending") {
    redirect("/verification");
  }

  const membership =
    verificationStatus === "verified" && sessionToken
      ? await getMembershipDetail(sessionToken)
      : null;

  return (
    <MembershipPage
      fullName={user?.full_name}
      avatar={user?.avatar}
      userId={user?.id}
      username={user?.username}
      verificationStatus={user?.verification_status}
      membership={membership}
    />
  );
}
