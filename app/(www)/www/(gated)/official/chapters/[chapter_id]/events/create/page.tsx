import type { Metadata } from "next";
import { renderOfficialEventCreate } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Buat Event",
  robots: { index: false, follow: false },
};

export default async function ChapterOfficialEventCreate({
  params,
}: {
  params: Promise<{ chapter_id: string }>;
}) {
  const { chapter_id } = await params;
  return renderOfficialEventCreate("chapter", chapter_id);
}
