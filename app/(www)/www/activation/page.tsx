import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getBranches } from "@/apis/branches";
import { getInstitutions } from "@/apis/institutions";
import { getSession } from "@/apis/session";
import ActivationPage from "@/components/pages/ActivationPage";

export const metadata: Metadata = {
  title: "Aktivasi Akun | HMI Connect",
};

export default async function Activation() {
  const { sessionToken, user } = await getSession();

  if (!sessionToken) return null;

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
