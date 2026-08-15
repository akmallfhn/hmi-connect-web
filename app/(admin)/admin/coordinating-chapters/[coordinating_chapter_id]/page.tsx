import type { Metadata } from "next";
import { getCoordinatingChapterDetail } from "@/apis/coordinating-chapters";
import AdminDashboardBanner from "@/components/banners/AdminDashboardBanner";
import AdminPageTitle from "@/components/common/AdminPageTitle";

export const metadata: Metadata = {
  title: "Dashboard Korkom",
  robots: {
    index: false,
    follow: false,
  },
};

interface CoordinatingChapterDetailPageProps {
  params: Promise<{ coordinating_chapter_id: string }>;
}

export default async function CoordinatingChapterDetailPage({
  params,
}: CoordinatingChapterDetailPageProps) {
  const { coordinating_chapter_id } = await params;
  const coordinatingChapter = await getCoordinatingChapterDetail(
    coordinating_chapter_id
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageTitle
        description={`Ringkasan data Komisariat di bawah Korkom ${coordinatingChapter?.name ?? "ini"}.`}
      >
        Dashboard Korkom
      </AdminPageTitle>

      <div className="mt-6">
        <AdminDashboardBanner />
      </div>
    </div>
  );
}
