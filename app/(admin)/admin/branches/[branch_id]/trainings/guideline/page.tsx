import type { Metadata } from "next";
import BranchLk2GuidelinePage from "@/components/pages/BranchLk2GuidelinePage";

export const metadata: Metadata = {
  title: "Guideline & Kurikulum LK2",
  robots: {
    index: false,
    follow: false,
  },
};

interface BranchLk2GuidelineRouteProps {
  params: Promise<{ branch_id: string }>;
}

export default async function BranchLk2GuidelineRoute({
  params,
}: BranchLk2GuidelineRouteProps) {
  const { branch_id } = await params;
  return <BranchLk2GuidelinePage branchId={branch_id} />;
}
