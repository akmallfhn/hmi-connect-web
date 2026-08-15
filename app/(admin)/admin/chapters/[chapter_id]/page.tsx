import type { Metadata } from "next";
import { getChapterDetail } from "@/apis/chapters";
import AdminDashboardBanner from "@/components/banners/AdminDashboardBanner";
import AdminPageTitle from "@/components/common/AdminPageTitle";

export const metadata: Metadata = {
  title: "Dashboard Komisariat",
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
  const chapter = await getChapterDetail(chapter_id);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageTitle
        description={`Ringkasan data kader di Komisariat ${chapter?.name ?? "ini"}.`}
      >
        Dashboard Komisariat
      </AdminPageTitle>

      <div className="mt-6">
        <AdminDashboardBanner />
      </div>
    </div>
  );
}
