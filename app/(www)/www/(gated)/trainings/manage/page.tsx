import type { Metadata } from "next";
import { renderOfficialTrainings } from "@/components/pages/OfficialTrainingRoutes";

export const metadata: Metadata = { title: "Kelola Training", robots: { index: false, follow: false } };

export default async function ManageTrainings({ searchParams }: {
  searchParams: Promise<{ search?: string; page?: string; saved?: string }>;
}) {
  return renderOfficialTrainings(await searchParams);
}
