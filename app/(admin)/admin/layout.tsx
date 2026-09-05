import { getSession } from "@/apis/session";
import { hasAnyManageAccess } from "@/lib/access";
import { getMainSiteOrigin } from "@/lib/constants";
import PageState from "@/components/states/PageState";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { sessionToken, user } = await getSession();
  const mainSiteOrigin = getMainSiteOrigin();

  if (!sessionToken) redirect(`${mainSiteOrigin}/auth/login`);

  if (!hasAnyManageAccess(user)) {
    return (
      <PageState
        variant="forbidden"
        backHref={mainSiteOrigin}
        message="Akun ini tidak memiliki akses ke panel admin."
      />
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-primary-light">
      <div className="bg-admin-geo-pattern min-h-screen">{children}</div>
    </div>
  );
}
