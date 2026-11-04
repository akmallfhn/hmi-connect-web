import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listEventsByTimeframe } from "@/apis/events";
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

  const search = query.search?.trim() ?? "";
  const page = Math.max(1, Number(query.page ?? "1") || 1);
  const timeframe = query.tab === "past" ? "past" : "upcoming";
  const result = await listEventsByTimeframe({
    search: search || undefined,
    timeframe,
    page,
    pageSize: 12,
  });
  return (
    <EventCatalogPage
      viewer={user}
      result={result}
      timeframe={timeframe}
      initialSearch={search}
    />
  );
}
