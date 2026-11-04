import type { Metadata } from "next";
import { renderOfficialEventEdit } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Edit Event",
  robots: { index: false, follow: false },
};

export default async function CoordinatingBodyOfficialEventEdit({
  params,
}: {
  params: Promise<{ coordinating_body_id: string; event_id: string }>;
}) {
  const { coordinating_body_id, event_id } = await params;
  return renderOfficialEventEdit("coordinating_body", coordinating_body_id, event_id);
}
