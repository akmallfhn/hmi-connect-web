import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import { getMainSiteOrigin } from "@/lib/constants";
import PageState from "@/components/states/PageState";
import MasterPlaceholderPage from "@/components/pages/MasterPlaceholderPage";

export const metadata: Metadata = {
  title: "Kelola Badko",
  robots: {
    index: false,
    follow: false,
  },
};

interface CoordinatingBodyDetailPageProps {
  params: Promise<{ coordinating_body_id: string }>;
}

export default async function CoordinatingBodyDetailPage({
  params,
}: CoordinatingBodyDetailPageProps) {
  const { coordinating_body_id } = await params;
  const { user } = await getSession();

  const isSuperAdmin = user?.role_name === "Super Admin";
  const canManageThisCoordinatingBody =
    Boolean(user?.can_manage_coordinating_body) &&
    user?.coordinating_body_id === coordinating_body_id;

  if (!isSuperAdmin && !canManageThisCoordinatingBody) {
    return (
      <PageState
        variant="forbidden"
        backHref={getMainSiteOrigin()}
        message="Kamu tidak memiliki akses untuk mengelola Badko ini."
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <MasterPlaceholderPage
        title="Kelola Badko"
        description={`Detail dan pengaturan Badko (ID: ${coordinating_body_id}) akan segera hadir di sini.`}
      />
    </div>
  );
}
