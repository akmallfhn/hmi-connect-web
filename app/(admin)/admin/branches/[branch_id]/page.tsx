import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import { getMainSiteOrigin } from "@/lib/constants";
import PageState from "@/components/states/PageState";
import MasterPlaceholderPage from "@/components/pages/MasterPlaceholderPage";

export const metadata: Metadata = {
  title: "Kelola Cabang",
  robots: {
    index: false,
    follow: false,
  },
};

interface BranchDetailPageProps {
  params: Promise<{ branch_id: string }>;
}

export default async function BranchDetailPage({
  params,
}: BranchDetailPageProps) {
  const { branch_id } = await params;
  const { user } = await getSession();

  const isSuperAdmin = user?.role_name === "Super Admin";
  const canManageThisBranch =
    Boolean(user?.can_manage_branch) && user?.branch_id === branch_id;

  if (!isSuperAdmin && !canManageThisBranch) {
    return (
      <PageState
        variant="forbidden"
        backHref={getMainSiteOrigin()}
        message="Kamu tidak memiliki akses untuk mengelola Cabang ini."
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <MasterPlaceholderPage
        title="Kelola Cabang"
        description={`Detail dan pengaturan Cabang (ID: ${branch_id}) akan segera hadir di sini.`}
      />
    </div>
  );
}
