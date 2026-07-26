import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import { getMainSiteOrigin } from "@/lib/constants";
import PageState from "@/components/states/PageState";
import MasterPlaceholderPage from "@/components/pages/MasterPlaceholderPage";

export const metadata: Metadata = {
  title: "Kelola Komisariat",
  robots: {
    index: false,
    follow: false,
  },
};

interface ChapterDetailPageProps {
  params: Promise<{ chapter_id: string }>;
}

export default async function ChapterDetailPage({
  params,
}: ChapterDetailPageProps) {
  const { chapter_id } = await params;
  const { user } = await getSession();

  const isSuperAdmin = user?.role_name === "Super Admin";
  const canManageThisChapter =
    Boolean(user?.can_manage_chapter) && user?.chapter_id === chapter_id;

  if (!isSuperAdmin && !canManageThisChapter) {
    return (
      <PageState
        variant="forbidden"
        backHref={getMainSiteOrigin()}
        message="Kamu tidak memiliki akses untuk mengelola Komisariat ini."
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <MasterPlaceholderPage
        title="Kelola Komisariat"
        description={`Detail dan pengaturan Komisariat (ID: ${chapter_id}) akan segera hadir di sini.`}
      />
    </div>
  );
}
