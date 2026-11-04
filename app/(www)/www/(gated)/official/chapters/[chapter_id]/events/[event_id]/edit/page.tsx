import type { Metadata } from "next";
import { renderOfficialEventEdit } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Edit Event",
  robots: { index: false, follow: false },
};

export default async function ChapterOfficialEventEdit({
  params,
}: {
  params: Promise<{ chapter_id: string; event_id: string }>;
}) {
  const { chapter_id, event_id } = await params;
  return renderOfficialEventEdit("chapter", chapter_id, event_id);
}
