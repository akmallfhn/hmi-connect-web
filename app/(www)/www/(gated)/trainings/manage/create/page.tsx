import type { Metadata } from "next";
import { renderOfficialTrainingCreate } from "@/components/pages/OfficialTrainingRoutes";

export const metadata: Metadata = { title: "Buat Training", robots: { index: false, follow: false } };

export default function CreateManagedTraining() {
  return renderOfficialTrainingCreate();
}
