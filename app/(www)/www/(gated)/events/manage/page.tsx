import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { renderOfficialEvents } from "@/components/pages/OfficialEventRoutes";

export const metadata: Metadata = {
  title: "Kelola Event",
  robots: { index: false, follow: false },
};

export default async function ManageEvents({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; tab?: string; saved?: string }>;
}) {
  const query = await searchParams;
  if (query.tab !== undefined) {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.page) params.set("page", query.page);
    if (query.saved) params.set("saved", query.saved);
    redirect(`/events/manage${params.size ? `?${params}` : ""}`);
  }
  return renderOfficialEvents(query);
}
