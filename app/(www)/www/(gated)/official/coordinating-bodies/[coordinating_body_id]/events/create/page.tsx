import type { Metadata } from "next";
import { renderOfficialEventCreate } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Buat Event",
  robots: { index: false, follow: false },
};

export default async function CoordinatingBodyOfficialEventCreate({
  params,
}: {
  params: Promise<{ coordinating_body_id: string }>;
}) {
  const { coordinating_body_id } = await params;
  return renderOfficialEventCreate("coordinating_body", coordinating_body_id);
}
