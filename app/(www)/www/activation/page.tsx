import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getBranches } from "@/apis/branches";
import { getInstitutions } from "@/apis/institutions";
import { getSession } from "@/apis/session";
import ActivationPage from "@/components/pages/ActivationPage";

const description =
  "Lengkapi data pendidikan, Latihan Kader 1, dan cabang untuk mengaktifkan akun HMI Connect.";

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

  const [branches, institutions] = await Promise.all([
    getBranches(),
    getInstitutions(),
  ]);

  return (
    <ActivationPage
      fullName={user?.full_name}
      branches={branches}
      institutions={institutions}
    />
  );
}
