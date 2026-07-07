import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { searchProvinces } from "@/apis/locations";
import { getSession } from "@/apis/session";
import VerificationPage from "@/components/pages/VerificationPage";

export const metadata: Metadata = {
  title: "Verifikasi Akun | HMI Connect",
};

export default async function Verification() {
  const { sessionToken, user } = await getSession();

  if (!sessionToken) redirect("/api/auth/clear-session");

  if (user?.status === "pending") redirect("/activation");
  if (user?.is_verified) redirect("/");

  const { list: provinces } = await searchProvinces();

  return <VerificationPage provinces={provinces} />;
}
