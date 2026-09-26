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
  // Listed in the sitemap, so it must be indexable — a noindex there contradicts the submission.
  robots: {
    index: true,
    follow: true,
  },
};

export default async function LoginPage() {
  return <AuthLoginPage />;
}
