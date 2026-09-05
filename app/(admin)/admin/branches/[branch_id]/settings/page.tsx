import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBranchDetail } from "@/apis/branches";
import { getSession } from "@/apis/session";
import { canManageEntity } from "@/lib/access";
import { listAllAccessGrants } from "@/apis/access-grants";
import BranchSettingsPage from "@/components/pages/BranchSettingsPage";

export const metadata: Metadata = {
  title: "Pengaturan Cabang",
  robots: { index: false, follow: false },
};

interface BranchSettingsRouteProps {
  params: Promise<{ branch_id: string }>;
}

export default async function BranchSettingsRoute({
  params,
}: BranchSettingsRouteProps) {
  const { branch_id } = await params;
  const [{ user }, branch, grants] = await Promise.all([
    getSession(),
    getBranchDetail(branch_id),
    listAllAccessGrants("branch", branch_id),
  ]);

  if (!branch) notFound();

  return (
    <BranchSettingsPage
      branch={branch}
      grants={grants}
      canManageAccess={canManageEntity(user, "branch", branch_id)}
    />
  );
}
