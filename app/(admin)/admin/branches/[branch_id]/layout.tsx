import type { ReactNode } from "react";
import { getBranchDetail } from "@/apis/branches";
import { getSession } from "@/apis/session";
import { getMainSiteOrigin } from "@/lib/constants";
import BranchSidebar from "@/components/navigations/BranchSidebar";
import PageState from "@/components/states/PageState";
import { BranchProvider } from "@/hooks/useBranch";

interface BranchLayoutProps {
  children: ReactNode;
  params: Promise<{ branch_id: string }>;
}

export default async function BranchLayout({
  children,
  params,
}: BranchLayoutProps) {
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

  const branch = await getBranchDetail(branch_id);
  if (!branch) {
    return <PageState variant="not_found" backHref={getMainSiteOrigin()} />;
  }

  return (
    <BranchProvider branchId={branch.id} branchName={branch.name}>
      <div className="flex min-h-screen">
        <BranchSidebar
          branchId={branch.id}
          branchName={branch.name}
          branchType={branch.type}
          fullName={user?.full_name}
          avatar={user?.avatar}
          roleName={user?.role_name}
        />
        <main className="min-h-screen min-w-0 flex-1 bg-[#f5f7fb]">
          {children}
        </main>
      </div>
    </BranchProvider>
  );
}
