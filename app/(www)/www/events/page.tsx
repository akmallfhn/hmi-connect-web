import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listEventsChronological } from "@/apis/events";
import { getSession } from "@/apis/session";
import EventCatalogPage from "@/components/pages/EventCatalogPage";

export const metadata: Metadata = {
  title: "Event",
  description: "Temukan dan ikuti agenda resmi HMI dari seluruh Indonesia.",
  robots: { index: false, follow: false },
};

export default async function EventsRoute({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; tab?: string }>;
}) {
  const [{ user }, query] = await Promise.all([getSession(), searchParams]);
  if (!user) redirect(`/auth/login?redirectTo=${encodeURIComponent("/events")}`);
  // This route sits outside (gated) to keep its redirectTo, so it owns the activation bounce too.
  if (user.status === "pending") redirect("/activation");

  if (query.tab !== undefined) {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.page) params.set("page", query.page);
    redirect(`/events${params.size ? `?${params}` : ""}`);
  }

  const search = query.search?.trim() ?? "";
  const page = Math.max(1, Number(query.page ?? "1") || 1);
  const result = await listEventsChronological({
    search: search || undefined,
    page,
    pageSize: 12,
  });
  return (
    <EventCatalogPage
      viewer={user}
      result={result}
      initialSearch={search}
    />
  );
}
