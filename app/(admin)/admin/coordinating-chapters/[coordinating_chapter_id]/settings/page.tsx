import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCoordinatingChapterDetail } from "@/apis/coordinating-chapters";
import { getSession } from "@/apis/session";
import { listCoordinatingChapterAdmins } from "@/apis/users";
import CoordinatingChapterSettingsPage from "@/components/pages/CoordinatingChapterSettingsPage";

export const metadata: Metadata = {
  title: "Pengaturan Korkom",
  robots: { index: false, follow: false },
};

interface CoordinatingChapterSettingsRouteProps {
  params: Promise<{ coordinating_chapter_id: string }>;
}

export default async function CoordinatingChapterSettingsRoute({
  params,
}: CoordinatingChapterSettingsRouteProps) {
  const { coordinating_chapter_id } = await params;
  const [{ user }, coordinatingChapter, admins] = await Promise.all([
    getSession(),
    getCoordinatingChapterDetail(coordinating_chapter_id),
    listCoordinatingChapterAdmins(coordinating_chapter_id),
  ]);

  if (!coordinatingChapter) notFound();

  return (
    <CoordinatingChapterSettingsPage
      coordinatingChapter={coordinatingChapter}
      admins={admins}
      isSuperAdmin={user?.role_name === "Super Admin"}
    />
  );
}
