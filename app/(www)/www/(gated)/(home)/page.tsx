import type { Metadata } from "next";
import FeedPage from "@/components/pages/FeedPage";
import { getSession } from "@/apis/session";

const description =
  "Ikuti kabar, postingan, dan aktivitas kader HMI melalui feed HMI Connect.";

export const metadata: Metadata = {
  title: "Beranda",
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Beranda | HMI Connect",
    description,
    url: "/",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function HomePage() {
  const { user } = await getSession();

  return (
    <FeedPage
      fullName={user?.full_name}
      avatar={user?.avatar}
      userId={user?.id}
      username={user?.username}
      userStatus={user?.status}
      verificationStatus={user?.verification_status}
    />
  );
}
