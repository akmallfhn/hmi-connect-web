import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/apis/session";
import { getTrainingDetail } from "@/apis/trainings";
import TrainingRegistrationPage from "@/components/pages/TrainingRegistrationPage";

export const metadata: Metadata = {
  title: "Pendaftaran Training",
  description: "Formulir pendaftaran training HMI.",
  robots: { index: false, follow: false },
};

interface TrainingRegistrationRouteProps {
  params: Promise<{ training_id: string }>;
}

export default async function TrainingRegistrationRoute({
  params,
}: TrainingRegistrationRouteProps) {
  const { training_id } = await params;
  const { sessionToken, user } = await getSession();

  if (!sessionToken || !user?.id) {
    redirect(
      `/auth/login?redirectTo=${encodeURIComponent(
        `/trainings/${training_id}/register`
      )}`
    );
  }

  const training = await getTrainingDetail(training_id);

  if (!training) notFound();

  return (
    <TrainingRegistrationPage
      training={training}
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user.id,
        username: user?.username,
        branchName: user?.branch_name,
        verificationStatus: user?.verification_status,
      }}
    />
  );
}
