import type { ReactNode } from "react";
import { getBranchDetail } from "@/apis/branches";
import { getSession } from "@/apis/session";
import { getMainSiteOrigin } from "@/lib/constants";
import EntitySidebar from "@/components/navigations/EntitySidebar";
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

  if (branch.status === "inactive") {
    return (
      <PageState
        variant="forbidden"
        backHref={getMainSiteOrigin()}
        message="Cabang ini sedang tidak aktif dan tidak dapat dikelola."
      />
    );
  }

  return (
    <BranchProvider branchId={branch.id} branchName={branch.name}>
      <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
        <EntitySidebar
          scope="branch"
          entityId={branch.id}
          entityName={branch.name}
          entityType={branch.type}
          imageUrl={branch.image_url}
          fullName={user?.full_name}
          avatar={user?.avatar}
          roleName={user?.role_name}
        />
        <main className="min-h-screen min-w-0 flex-1 lg:min-h-0 lg:overflow-y-auto">
          {children}
        </main>
      </div>
    </BranchProvider>
  );
}
