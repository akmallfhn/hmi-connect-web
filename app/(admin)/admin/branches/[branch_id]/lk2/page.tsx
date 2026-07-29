import type { Metadata } from "next";
import BranchLk2Page from "@/components/pages/BranchLk2Page";

export const metadata: Metadata = {
  title: "Latihan Kader 2",
  robots: {
    index: false,
    follow: false,
  },
};

interface BranchLk2RouteProps {
  params: Promise<{ branch_id: string }>;
}

export default async function BranchLk2Route({ params }: BranchLk2RouteProps) {
  const { branch_id } = await params;
  return <BranchLk2Page branchId={branch_id} />;
}
