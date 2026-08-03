import type { Metadata } from "next";
import TrainingLK2GuidelinePage from "@/components/pages/TrainingLK2GuidelinePage";

export const metadata: Metadata = {
  title: "Guideline & Kurikulum LK2",
  robots: {
    index: false,
    follow: false,
  },
};

interface TrainingLK2GuidelineRouteProps {
  params: Promise<{ branch_id: string }>;
}

export default async function TrainingLK2GuidelineRoute({
  params,
}: TrainingLK2GuidelineRouteProps) {
  const { branch_id } = await params;
  return <TrainingLK2GuidelinePage branchId={branch_id} />;
}
