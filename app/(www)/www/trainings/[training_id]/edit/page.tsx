import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/apis/session";
import { getTrainingDetail } from "@/apis/trainings";
import TrainingCreatePage from "@/components/pages/TrainingCreatePage";
import PageState from "@/components/states/PageState";

export const metadata: Metadata = {
  title: "Edit Event Training",
  robots: { index: false, follow: false },
};

interface TrainingEditRouteProps {
  params: Promise<{ training_id: string }>;
}

export default async function TrainingEditRoute({
  params,
}: TrainingEditRouteProps) {
  const { training_id } = await params;
  const [{ user }, training] = await Promise.all([
    getSession(),
    getTrainingDetail(training_id),
  ]);

  if (!user?.id) {
    redirect(
      `/auth/login?redirectTo=${encodeURIComponent(`/trainings/${training_id}/edit`)}`,
    );
  }
  if (user.status === "pending") redirect("/activation");
  if (user.verification_status === "unverified") redirect("/verification");
  if (user.verification_status !== "verified") {
    return (
      <PageState
        variant="forbidden"
        backHref={`/trainings/${training_id}`}
        message="Akunmu sedang ditinjau admin. Kamu bisa mengubah event setelah verifikasi disetujui."
      />
    );
  }
  if (!training) notFound();

  return (
    <TrainingCreatePage
      viewer={{
        fullName: user.full_name,
        avatar: user.avatar,
        userId: user.id,
        username: user.username,
        branchName: user.branch_name,
        verificationStatus: user.verification_status,
      }}
      training={training}
    />
  );
}
