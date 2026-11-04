import type { Metadata } from "next";
import { renderOfficialEventDetail } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Detail Event",
  robots: { index: false, follow: false },
};

export default async function CoordinatingChapterOfficialEventDetail({
  params,
}: {
  params: Promise<{ coordinating_chapter_id: string; event_id: string }>;
}) {
  const { coordinating_chapter_id, event_id } = await params;
  return renderOfficialEventDetail("coordinating_chapter", coordinating_chapter_id, event_id);
}
