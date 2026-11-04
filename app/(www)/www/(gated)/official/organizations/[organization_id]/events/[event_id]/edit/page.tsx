import type { Metadata } from "next";
import { renderOfficialEventEdit } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Edit Event",
  robots: { index: false, follow: false },
};

export default async function OrganizationOfficialEventEdit({
  params,
}: {
  params: Promise<{ organization_id: string; event_id: string }>;
}) {
  const { organization_id, event_id } = await params;
  return renderOfficialEventEdit("organization", organization_id, event_id);
}
