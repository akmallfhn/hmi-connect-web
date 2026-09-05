import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChapterDetail } from "@/apis/chapters";
import { getSession } from "@/apis/session";
import { canManageEntity } from "@/lib/access";
import { listAllAccessGrants } from "@/apis/access-grants";
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
  const [{ user }, chapter, grants] = await Promise.all([
    getSession(),
    getChapterDetail(chapter_id),
    listAllAccessGrants("chapter", chapter_id),
  ]);

  if (!chapter) notFound();

  return (
    <ChapterSettingsPage
      chapter={chapter}
      grants={grants}
      canManageAccess={canManageEntity(user, "chapter", chapter_id)}
    />
  );
}
