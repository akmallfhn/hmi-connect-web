import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/apis/session";
import { getTrainingDetail } from "@/apis/trainings";
import { getUserByUsername, listTrainingHistories } from "@/apis/users";
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

  const [training, profile, trainingHistoryResult] = await Promise.all([
    getTrainingDetail(training_id),
    getUserByUsername(user.username, sessionToken),
    listTrainingHistories(user.username, { pageSize: 100 }),
  ]);

  if (!training || !profile) notFound();

  return (
    <TrainingRegistrationPage
      training={training}
      registrant={{
        id: profile.id,
        fullName: profile.full_name,
        email: profile.email,
        phoneNumber: profile.phone_number,
        branchName: profile.branch_name,
      }}
      trainingHistories={trainingHistoryResult.list}
      viewer={{
        fullName: profile.full_name,
        avatar: profile.avatar,
        userId: profile.id,
        username: profile.username,
        branchName: profile.branch_name,
        verificationStatus: profile.verification_status,
      }}
    />
  );
}
