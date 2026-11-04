import type { Metadata } from "next";
import { renderOfficialEvents } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Kelola Event",
  robots: { index: false, follow: false },
};

export default async function ChapterOfficialEvents({
  params,
  searchParams,
}: {
  params: Promise<{ chapter_id: string }>;
  searchParams: Promise<{ search?: string; page?: string; tab?: string }>;
}) {
  const [{ chapter_id }, query] = await Promise.all([params, searchParams]);
  return renderOfficialEvents("chapter", chapter_id, query);
}
