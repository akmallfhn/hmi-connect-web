import type { Metadata } from "next";
import { renderOfficialEventCreate } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Buat Event",
  robots: { index: false, follow: false },
};

export default async function OrganizationOfficialEventCreate({
  params,
}: {
  params: Promise<{ organization_id: string }>;
}) {
  const { organization_id } = await params;
  return renderOfficialEventCreate("organization", organization_id);
}
