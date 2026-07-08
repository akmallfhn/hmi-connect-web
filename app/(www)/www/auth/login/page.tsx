import AuthLoginPage from "@/components/pages/AuthLoginPage";
import type { Metadata } from "next";

const description =
  "Masuk ke HMI Connect untuk melanjutkan akses akun dan aktivitas organisasi.";

export const metadata: Metadata = {
  title: "Login",
  description,
  alternates: {
    canonical: "/auth/login",
  },
  openGraph: {
    title: "Login | HMI Connect",
    description,
    url: "/auth/login",
    siteName: "HMI Connect",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage() {
  return <AuthLoginPage />;
}
