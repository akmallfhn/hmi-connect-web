import type { Metadata } from "next";
import { checkPasswordResetSession } from "@/apis/auth";
import ResetPasswordPage from "@/components/pages/ResetPasswordPage";
import { isSuccessStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Atur Ulang Password",
  description: "Buat password baru untuk akun HMI Connect kamu.",
  robots: {
    index: false,
    follow: false,
  },
};

interface ResetPasswordRouteProps {
  params: Promise<{ session_id: string }>;
}

export default async function ResetPassword({
  params,
}: ResetPasswordRouteProps) {
  const { session_id } = await params;
  // Checking doesn't consume the reset session, so a dead link is refused before any form renders.
  const result = await checkPasswordResetSession(session_id);
  const valid = isSuccessStatus(result.status);

  return (
    <ResetPasswordPage
      sessionId={session_id}
      valid={valid}
      invalidMessage={valid ? undefined : result.message}
    />
  );
}
