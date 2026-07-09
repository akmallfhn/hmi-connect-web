import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getInstitutions } from "@/apis/institutions";
import { getSession } from "@/apis/session";
import ActivationPage from "@/components/pages/ActivationPage";

const description =
  "Lengkapi profil, data pendidikan, dan Latihan Kader 1 untuk mengaktifkan akun HMI Connect.";

export const metadata: Metadata = {
  title: "Aktivasi Akun",
  description,
  alternates: {
    canonical: "/activation",
  },
  openGraph: {
    title: "Aktivasi Akun | HMI Connect",
    description,
    url: "/activation",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Activation() {
  const { sessionToken, user } = await getSession();

  if (!sessionToken) redirect("/api/auth/clear-session");

  if (user?.status !== "pending") redirect("/");

  const institutions = await getInstitutions();

  return (
    <ActivationPage
      userId={user?.id}
      fullName={user?.full_name}
      avatar={user?.avatar}
      institutions={institutions}
    />
  );
}
