import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBranchDetail } from "@/apis/branches";
import { getSession } from "@/apis/session";
import { listBranchAdmins } from "@/apis/users";
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
  const [{ user }, branch, admins] = await Promise.all([
    getSession(),
    getBranchDetail(branch_id),
    listBranchAdmins(branch_id),
  ]);

  if (!branch) notFound();

  return (
    <BranchSettingsPage
      branch={branch}
      admins={admins}
      isSuperAdmin={user?.role_name === "Super Admin"}
    />
  );
}
