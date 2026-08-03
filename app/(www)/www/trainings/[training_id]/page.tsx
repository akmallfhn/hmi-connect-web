import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/apis/session";
import { getTrainingDetail } from "@/apis/trainings";
import PublicTrainingDetailPage from "@/components/pages/PublicTrainingDetailPage";

interface TrainingDetailRouteProps {
  params: Promise<{ training_id: string }>;
}

export async function generateMetadata({
  params,
}: TrainingDetailRouteProps): Promise<Metadata> {
  const { training_id } = await params;
  const training = await getTrainingDetail(training_id);

  if (!training) {
    return {
      title: "Training Tidak Ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const description =
    training.description ||
    `${training.name} diselenggarakan oleh ${training.organizer_name ?? "HMI"}.`;
  const url = `/trainings/${training.id}`;

  return {
    title: training.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${training.name} | HMI Connect`,
      description,
      url,
      images: training.image_url ? [training.image_url] : undefined,
    },
    twitter: {
      card: training.image_url ? "summary_large_image" : "summary",
      title: `${training.name} | HMI Connect`,
      description,
      images: training.image_url ? [training.image_url] : undefined,
    },
  };
}

export default async function TrainingDetailRoute({
  params,
}: TrainingDetailRouteProps) {
  const { training_id } = await params;
  const [training, { user }] = await Promise.all([
    getTrainingDetail(training_id),
    getSession(),
  ]);

  if (!training) notFound();

  return (
    <PublicTrainingDetailPage
      training={training}
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        branchName: user?.branch_name,
        verificationStatus: user?.verification_status,
      }}
    />
  );
}
