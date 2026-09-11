import AuthForgetPasswordPage from "@/components/pages/AuthForgetPasswordPage";
import type { Metadata } from "next";

const description =
  "Kirim tautan untuk membuat password baru ke email akun HMI Connect kamu.";

export const metadata: Metadata = {
  title: "Lupa Password",
  description,
  alternates: {
    canonical: "/auth/forget-password",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ForgetPassword() {
  return <AuthForgetPasswordPage />;
}
