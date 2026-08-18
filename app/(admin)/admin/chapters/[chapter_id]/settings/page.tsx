import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChapterDetail } from "@/apis/chapters";
import { getSession } from "@/apis/session";
import { listChapterAdmins } from "@/apis/users";
import ChapterSettingsPage from "@/components/pages/ChapterSettingsPage";

export const metadata: Metadata = {
  title: "Pengaturan Komisariat",
  robots: { index: false, follow: false },
};

interface ChapterSettingsRouteProps {
  params: Promise<{ chapter_id: string }>;
}

export default async function ChapterSettingsRoute({
  params,
}: ChapterSettingsRouteProps) {
  const { chapter_id } = await params;
  const [{ user }, chapter, admins] = await Promise.all([
    getSession(),
    getChapterDetail(chapter_id),
    listChapterAdmins(chapter_id),
  ]);

  if (!chapter) notFound();

  return (
    <ChapterSettingsPage
      chapter={chapter}
      admins={admins}
      isSuperAdmin={user?.role_name === "Super Admin"}
    />
  );
}
