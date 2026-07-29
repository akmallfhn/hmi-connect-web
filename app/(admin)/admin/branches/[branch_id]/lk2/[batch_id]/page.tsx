import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BranchLk2DetailPage from "@/components/pages/BranchLk2DetailPage";
import { LK2_BATCHES } from "@/components/lk2/mockData";

interface BranchLk2DetailRouteProps {
  params: Promise<{ branch_id: string; batch_id: string }>;
}

export async function generateMetadata({
  params,
}: BranchLk2DetailRouteProps): Promise<Metadata> {
  const { batch_id } = await params;
  const batch = LK2_BATCHES.find((item) => item.id === batch_id);
  return {
    title: batch ? batch.name : "Latihan Kader 2",
    robots: { index: false, follow: false },
  };
}

export default async function BranchLk2DetailRoute({
  params,
}: BranchLk2DetailRouteProps) {
  const { branch_id, batch_id } = await params;
  const batch = LK2_BATCHES.find((item) => item.id === batch_id);

  if (!batch) notFound();

  return <BranchLk2DetailPage branchId={branch_id} batch={batch} />;
}
