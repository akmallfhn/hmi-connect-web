import { getSession } from "@/apis/session";
import { getVerificationCount } from "@/apis/stat";
import { getMainSiteOrigin } from "@/lib/constants";
import PageState from "@/components/states/PageState";
import MasterSidebar from "@/components/navigations/MasterSidebar";
import type { ReactNode } from "react";

export default async function MasterLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await getSession();
  const isSuperAdmin = user?.role_name === "Super Admin";

  if (!isSuperAdmin) {
    return (
      <PageState
        variant="forbidden"
        backHref={getMainSiteOrigin()}
        message="Halaman ini cuma bisa diakses oleh Super Admin."
      />
    );
  }

  const verificationCount = await getVerificationCount();

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
      <MasterSidebar
        fullName={user?.full_name}
        avatar={user?.avatar}
        email={user?.email}
        organizationId={user?.organization_id ?? process.env.ORGANIZATION_ID}
        pendingVerificationCount={verificationCount?.pending_count ?? 0}
      />
      <main className="min-h-screen min-w-0 flex-1 lg:min-h-0 lg:overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
