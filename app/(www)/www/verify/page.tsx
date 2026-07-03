import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getBranches } from "@/apis/branches";
import { getInstitutions } from "@/apis/institutions";
import { getSession } from "@/apis/session";
import VerifyPage from "@/components/pages/VerifyPage";

export const metadata: Metadata = {
  title: "Verifikasi Akun | HMI Connect",
};

export default async function Verify() {
  const { sessionToken, user } = await getSession();

  if (!sessionToken) return null;

  if (user?.is_verified) redirect("/");

  const [branches, institutions] = await Promise.all([
    getBranches(),
    getInstitutions(),
  ]);

  return (
    <VerifyPage
      fullName={user?.full_name}
      branches={branches}
      institutions={institutions}
    />
  );
}
