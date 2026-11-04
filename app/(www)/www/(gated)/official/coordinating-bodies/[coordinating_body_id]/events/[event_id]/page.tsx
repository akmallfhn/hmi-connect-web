import type { Metadata } from "next";
import { renderOfficialEventDetail } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Detail Event",
  robots: { index: false, follow: false },
};

export default async function CoordinatingBodyOfficialEventDetail({
  params,
}: {
  params: Promise<{ coordinating_body_id: string; event_id: string }>;
}) {
  const { coordinating_body_id, event_id } = await params;
  return renderOfficialEventDetail("coordinating_body", coordinating_body_id, event_id);
}
