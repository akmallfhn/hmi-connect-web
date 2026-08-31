import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChapterDetail } from "@/apis/chapters";
import { getSession } from "@/apis/session";
import {
  getStructuralPeriodDetail,
  listStructuralPeriods,
} from "@/apis/structurals";
import ChapterStructuralPage from "@/components/pages/ChapterStructuralPage";

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

  const [{ user }, chapter, periods] = await Promise.all([
    getSession(),
    getChapterDetail(chapter_id),
    listStructuralPeriods({
      entityType: "chapter",
      entityId: chapter_id,
      pageSize: 50,
    }),
  ]);

  if (!chapter) notFound();

  const requestedPeriodId = period ? Number(period) : NaN;
  const requestedPeriodIsValid =
    !Number.isNaN(requestedPeriodId) &&
    periods.list.some((item) => item.id === requestedPeriodId);

  // Prefer the still-ongoing period (null end_year) over just the newest start_year.
  const defaultPeriodId =
    periods.list.find((item) => item.end_year === null)?.id ??
    periods.list[0]?.id ??
    null;

  const selectedPeriodId = requestedPeriodIsValid
    ? requestedPeriodId
    : defaultPeriodId;

  const selectedPeriod = selectedPeriodId
    ? await getStructuralPeriodDetail(selectedPeriodId)
    : null;

  const isSuperAdmin = user?.role_name === "Super Admin";
  const canManage =
    isSuperAdmin ||
    (Boolean(user?.can_manage_chapter) && user?.chapter_id === chapter.id);

  return (
    <ChapterStructuralPage
      chapter={chapter}
      periods={periods.list}
      selectedPeriod={selectedPeriod}
      selectedPeriodId={selectedPeriodId}
      canManage={canManage}
    />
  );
}
