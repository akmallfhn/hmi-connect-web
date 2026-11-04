import type { Metadata } from "next";
import { renderOfficialEventDetail } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Detail Event",
  robots: { index: false, follow: false },
};

export default async function ChapterOfficialEventDetail({
  params,
}: {
  params: Promise<{ chapter_id: string; event_id: string }>;
}) {
  const { chapter_id, event_id } = await params;
  return renderOfficialEventDetail("chapter", chapter_id, event_id);
}
