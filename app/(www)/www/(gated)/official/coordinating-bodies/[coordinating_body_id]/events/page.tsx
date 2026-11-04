import type { Metadata } from "next";
import { renderOfficialEvents } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Kelola Event",
  robots: { index: false, follow: false },
};

export default async function CoordinatingBodyOfficialEvents({
  params,
  searchParams,
}: {
  params: Promise<{ coordinating_body_id: string }>;
  searchParams: Promise<{ search?: string; page?: string; tab?: string }>;
}) {
  const [{ coordinating_body_id }, query] = await Promise.all([params, searchParams]);
  return renderOfficialEvents("coordinating_body", coordinating_body_id, query);
}
