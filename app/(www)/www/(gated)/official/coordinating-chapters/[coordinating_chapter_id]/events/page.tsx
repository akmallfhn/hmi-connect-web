import type { Metadata } from "next";
import { renderOfficialEvents } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Kelola Event",
  robots: { index: false, follow: false },
};

export default async function CoordinatingChapterOfficialEvents({
  params,
  searchParams,
}: {
  params: Promise<{ coordinating_chapter_id: string }>;
  searchParams: Promise<{ search?: string; page?: string; tab?: string }>;
}) {
  const [{ coordinating_chapter_id }, query] = await Promise.all([params, searchParams]);
  return renderOfficialEvents("coordinating_chapter", coordinating_chapter_id, query);
}
