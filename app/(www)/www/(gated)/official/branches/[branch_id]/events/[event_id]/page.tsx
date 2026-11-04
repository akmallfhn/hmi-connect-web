import type { Metadata } from "next";
import { renderOfficialEventDetail } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Detail Event",
  robots: { index: false, follow: false },
};

export default async function BranchOfficialEventDetail({
  params,
}: {
  params: Promise<{ branch_id: string; event_id: string }>;
}) {
  const { branch_id, event_id } = await params;
  return renderOfficialEventDetail("branch", branch_id, event_id);
}
