import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCoordinatingChapterDetail } from "@/apis/coordinating-chapters";
import { getSession } from "@/apis/session";
import { canManageEntity } from "@/lib/access";
import { listAllAccessGrants } from "@/apis/access-grants";
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
  const [{ user }, coordinatingChapter, grants] = await Promise.all([
    getSession(),
    getCoordinatingChapterDetail(coordinating_chapter_id),
    listAllAccessGrants("coordinating_chapter", coordinating_chapter_id),
  ]);

  if (!coordinatingChapter) notFound();

  return (
    <CoordinatingChapterSettingsPage
      coordinatingChapter={coordinatingChapter}
      grants={grants}
      canManageAccess={canManageEntity(user, "coordinating_chapter", coordinating_chapter_id)}
    />
  );
}
