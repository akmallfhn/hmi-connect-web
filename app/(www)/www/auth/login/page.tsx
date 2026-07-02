import AuthLoginHMI from "@/components/pages/AuthLoginPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | HMI Connect",
  description:
    "Masuk ke HMI Connect untuk melanjutkan akses akun dan aktivitas organisasi.",
  alternates: {
    canonical: "/auth/login",
  },
  openGraph: {
    title: "Login | HMI Connect",
    description:
      "Masuk ke HMI Connect untuk melanjutkan akses akun dan aktivitas organisasi.",
    url: "/auth/login",
    siteName: "HMI Connect",
  },
};

export default function LoginPage() {
  return <AuthLoginHMI />;
}
