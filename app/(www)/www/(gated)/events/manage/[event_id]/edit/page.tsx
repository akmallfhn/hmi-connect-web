import type { Metadata } from "next";
import { renderOfficialEventEdit } from "@/components/pages/OfficialEventRoutes";

export const metadata: Metadata = {
  title: "Edit Event",
  robots: { index: false, follow: false },
};

export default async function EditManagedEvent({
  params,
}: {
  params: Promise<{ event_id: string }>;
}) {
  const { event_id } = await params;
  return renderOfficialEventEdit(event_id);
}
