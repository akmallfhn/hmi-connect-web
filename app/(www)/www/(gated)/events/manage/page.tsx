import type { Metadata } from "next";
import { renderOfficialEvents } from "@/components/pages/OfficialEventRoutes";

export const metadata: Metadata = {
  title: "Kelola Event",
  robots: { index: false, follow: false },
};

export default async function ManageEvents({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; tab?: string }>;
}) {
  return renderOfficialEvents(await searchParams);
}
