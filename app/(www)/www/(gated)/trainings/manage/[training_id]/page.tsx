import type { Metadata } from "next";
import { renderOfficialTrainingEdit } from "@/components/pages/OfficialTrainingRoutes";

export const metadata: Metadata = { title: "Edit Training", robots: { index: false, follow: false } };

export default async function ManagedTraining({ params }: {
  params: Promise<{ training_id: string }>;
}) {
  const { training_id } = await params;
  return renderOfficialTrainingEdit(training_id);
}
