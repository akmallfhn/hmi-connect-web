import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVerificationRequestDetail } from "@/apis/access";
import BranchVerificationDetailPage from "@/components/pages/BranchVerificationDetailPage";

export const metadata: Metadata = {
  title: "Detail Permintaan Verifikasi",
  robots: {
    index: false,
    follow: false,
  },
};

interface BranchVerificationRequestDetailPageProps {
  params: Promise<{ branch_id: string; id: string }>;
}

export default async function BranchVerificationRequestDetailPage({
  params,
}: BranchVerificationRequestDetailPageProps) {
  const { branch_id, id } = await params;
  const request = await getVerificationRequestDetail(id);

  if (!request) return notFound();

  return <BranchVerificationDetailPage branchId={branch_id} request={request} />;
}
