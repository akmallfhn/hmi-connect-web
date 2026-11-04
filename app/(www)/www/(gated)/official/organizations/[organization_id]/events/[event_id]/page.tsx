import type { Metadata } from "next";
import { renderOfficialEventDetail } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Detail Event",
  robots: { index: false, follow: false },
};

export default async function OrganizationOfficialEventDetail({
  params,
}: {
  params: Promise<{ organization_id: string; event_id: string }>;
}) {
  const { organization_id, event_id } = await params;
  return renderOfficialEventDetail("organization", organization_id, event_id);
}
