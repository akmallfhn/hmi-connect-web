import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import { getStructuralOverview } from "@/apis/structurals";
import { canManageEntity } from "@/lib/access";
import StructuralPage from "@/components/pages/StructuralPage";

export const metadata: Metadata = {
  title: "Struktur Kepengurusan Komisariat",
  robots: { index: false, follow: false },
};

interface ChapterStructuralRouteProps {
  params: Promise<{ chapter_id: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function ChapterStructuralRoute({
  params,
  searchParams,
}: ChapterStructuralRouteProps) {
  const { chapter_id } = await params;
  const { period } = await searchParams;

  const [{ user }, overview] = await Promise.all([
    getSession(),
    getStructuralOverview("chapter", chapter_id, period ? Number(period) : null),
  ]);

  const canManage = canManageEntity(user, "chapter", chapter_id);

  return (
    <StructuralPage
      entityType="chapter"
      entityId={chapter_id}
      periods={overview.periods}
      selectedPeriod={overview.selectedPeriod}
      selectedPeriodId={overview.selectedPeriodId}
      canManage={canManage}
    />
  );
}
