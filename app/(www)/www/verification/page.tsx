import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { searchProvinces } from "@/apis/locations";
import { getSession } from "@/apis/session";
import VerificationPage from "@/components/pages/VerificationPage";

const description =
  "Verifikasi data KTP untuk melengkapi keamanan dan kredibilitas akun HMI Connect.";

export const metadata: Metadata = {
  title: "Verifikasi Akun",
  description,
  alternates: {
    canonical: "/verification",
  },
  openGraph: {
    title: "Verifikasi Akun | HMI Connect",
    description,
    url: "/verification",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Verification() {
  const { sessionToken, user } = await getSession();

  if (!sessionToken) redirect("/api/auth/clear-session");

  if (user?.status === "pending") redirect("/activation");
  if (user?.is_verified) redirect("/");

  const { list: provinces } = await searchProvinces();

  return <VerificationPage provinces={provinces} />;
}
