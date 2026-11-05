import { IconCalendarEvent } from "@tabler/icons-react";
import type { PagedEventResult } from "@/apis/events";
import type { SessionUser } from "@/apis/session";
import EventCard from "../events/EventCard";
import EventListControls from "../events/EventListControls";
import EventPageShell from "../events/EventPageShell";
import PageBanner from "../common/PageBanner";
import PageMargin from "../common/PageMargin";
import Pagination from "../common/Pagination";
import EmptyState from "../states/EmptyState";

export default function EventCatalogPage({
  viewer,
  result,
  initialSearch,
}: {
  viewer: SessionUser;
  result: PagedEventResult;
  initialSearch: string;
}) {
  const emptyTitle = initialSearch ? "Event tidak ditemukan" : "Belum ada event";
  const emptyDescription = initialSearch
    ? "Coba kata kunci lain atau hapus pencarian."
    : "Agenda dari Official Account HMI akan muncul di sini.";

  return (
    <EventPageShell viewer={viewer} mobileBackTitle="Event">
      <PageMargin className="pt-3 lg:pt-6">
        <main className="flex flex-col gap-4 pb-6 lg:gap-6 lg:pb-10">
          <PageBanner className="bg-brand-deep">
            <div className="relative z-10 max-w-[70%] font-stack-sans-headline">
              <h1 className="text-[15px] font-medium leading-snug sm:text-xl lg:text-2xl">
                Event HMI
              </h1>
              <p className="mt-1 text-[11px] text-on-dark/70 sm:text-sm lg:text-base">
                Temukan agenda dari Official Account HMI, lalu ikuti yang kamu minati.
              </p>
            </div>
            <IconCalendarEvent
              className="pointer-events-none absolute -bottom-4 right-3 size-24 text-on-dark/15 lg:right-10 lg:size-36"
              stroke={1.2}
              aria-hidden="true"
            />
          </PageBanner>

          <EventListControls
            basePath="/events"
            initialSearch={initialSearch}
          />

          {result.list.length === 0 ? (
            <div className="overflow-hidden rounded-2xl border border-dashed border-border-strong bg-surface">
              <EmptyState title={emptyTitle} description={emptyDescription} />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
              {result.list.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          {result.totalPage > 1 && (
            <Pagination currentPage={result.currentPage} totalPages={result.totalPage} />
          )}
        </main>
      </PageMargin>
    </EventPageShell>
  );
}
