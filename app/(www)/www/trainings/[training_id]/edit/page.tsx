import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/apis/session";
import { getTrainingDetail } from "@/apis/trainings";
import TrainingCreatePage from "@/components/pages/TrainingCreatePage";
import PageState from "@/components/states/PageState";
import { canManageEntity } from "@/lib/access";

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

  // Mirrors trainings/update: the contact person, Super Admin, or a grant at the organizer.
  const canEdit =
    training.contact_person_id === user.id ||
    (training.organizer_type && training.organizer_id
      ? canManageEntity(user, training.organizer_type, training.organizer_id)
      : false);
  if (!canEdit) {
    return (
      <PageState
        variant="forbidden"
        backHref={`/trainings/${training_id}`}
        message="Hanya pembuat event yang bisa mengubah event ini."
      />
    );
  }

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
