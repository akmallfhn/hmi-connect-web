import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import { getStructuralOverview } from "@/apis/structurals";
import { canManageEntity } from "@/lib/access";
import StructuralPage from "@/components/pages/StructuralPage";

export const metadata: Metadata = {
  title: "Struktur Kepengurusan Korkom",
  robots: { index: false, follow: false },
};

interface CoordinatingChapterStructuralRouteProps {
  params: Promise<{ coordinating_chapter_id: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function CoordinatingChapterStructuralRoute({
  params,
  searchParams,
}: CoordinatingChapterStructuralRouteProps) {
  const { coordinating_chapter_id } = await params;
  const { period } = await searchParams;

  const [{ user }, overview] = await Promise.all([
    getSession(),
    getStructuralOverview(
      "coordinating_chapter",
      coordinating_chapter_id,
      period ? Number(period) : null
    ),
  ]);

  const canManage = canManageEntity(user, "coordinating_chapter", coordinating_chapter_id);

  return (
    <StructuralPage
      entityType="coordinating_chapter"
      entityId={coordinating_chapter_id}
      periods={overview.periods}
      selectedPeriod={overview.selectedPeriod}
      selectedPeriodId={overview.selectedPeriodId}
      canManage={canManage}
    />
  );
}
