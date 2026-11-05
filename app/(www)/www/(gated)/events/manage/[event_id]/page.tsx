import type { Metadata } from "next";
import { renderOfficialEventDetail } from "@/components/pages/OfficialEventRoutes";

export const metadata: Metadata = {
  title: "Detail Event",
  robots: { index: false, follow: false },
};

export default async function ManagedEventDetail({
  params,
}: {
  params: Promise<{ event_id: string }>;
}) {
  const { event_id } = await params;
  return renderOfficialEventDetail(event_id);
}
