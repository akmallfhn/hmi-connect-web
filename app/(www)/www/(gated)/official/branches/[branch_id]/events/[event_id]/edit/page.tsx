import type { Metadata } from "next";
import { renderOfficialEventEdit } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Edit Event",
  robots: { index: false, follow: false },
};

export default async function BranchOfficialEventEdit({
  params,
}: {
  params: Promise<{ branch_id: string; event_id: string }>;
}) {
  const { branch_id, event_id } = await params;
  return renderOfficialEventEdit("branch", branch_id, event_id);
}
