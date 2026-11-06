import { redirect } from "next/navigation";

export default async function EditManagedTraining({ params }: {
  params: Promise<{ training_id: string }>;
}) {
  const { training_id } = await params;
  redirect(`/trainings/manage/${training_id}`);
}
