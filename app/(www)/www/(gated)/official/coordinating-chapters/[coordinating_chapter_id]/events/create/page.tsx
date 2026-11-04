import type { Metadata } from "next";
import { renderOfficialEventCreate } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Buat Event",
  robots: { index: false, follow: false },
};

export default async function CoordinatingChapterOfficialEventCreate({
  params,
}: {
  params: Promise<{ coordinating_chapter_id: string }>;
}) {
  const { coordinating_chapter_id } = await params;
  return renderOfficialEventCreate("coordinating_chapter", coordinating_chapter_id);
}
