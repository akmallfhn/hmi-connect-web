import { IconPlus } from "@tabler/icons-react";
import type { PagedEventResult } from "@/apis/events";
import type { ComposerAuthorEntity } from "../forms/CreateFeedForms";
import { MANAGE_EVENTS_HREF } from "@/lib/access";
import EventCard from "../events/EventCard";
import EventLinkButton from "../events/EventLinkButton";
import EventListControls from "../events/EventListControls";
import EventSaveToast from "../events/EventSaveToast";
import PageMargin from "../common/PageMargin";
import Pagination from "../common/Pagination";
import EmptyState from "../states/EmptyState";
import OfficialPageShell from "../official/OfficialPageShell";

export default function OfficialEventsPage({
  entity,
  result,
  initialSearch,
  saved,
}: {
  entity: ComposerAuthorEntity;
  result: PagedEventResult;
  initialSearch: string;
  saved?: "created" | "updated";
}) {
  const baseHref = MANAGE_EVENTS_HREF;
  const createHref = `${baseHref}/create`;
  const isEmptyCollection = !initialSearch;

  return (
    <OfficialPageShell entity={entity} compactGreeting>
      <EventSaveToast kind={saved} />
      <PageMargin className="pt-4 lg:pt-6">
        <main className="flex flex-col gap-4 pb-6 lg:gap-6 lg:pb-10">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-stack-sans-headline text-xl font-medium text-heading sm:text-2xl">
                Kelola Event
              </h1>
            </div>
            <EventLinkButton href={createHref}>
              <IconPlus className="size-4.5" stroke={2.4} />
              Buat event
            </EventLinkButton>
          </div>

          <EventListControls
            basePath={baseHref}
            initialSearch={initialSearch}
          />

          {result.list.length === 0 ? (
            <div className="overflow-hidden rounded-2xl border border-dashed border-border-strong bg-surface">
              <EmptyState
                title={
                  initialSearch
                    ? "Event tidak ditemukan"
                    : "Belum ada event"
                }
                description={
                  initialSearch
                    ? "Coba kata kunci lain atau hapus pencarian."
                    : `Buat agenda atas nama ${entity.name} agar kader bisa ikut.`
                }
                action={
                  isEmptyCollection ? (
                    <EventLinkButton href={createHref}>
                      <IconPlus className="size-4.5" stroke={2.4} />
                      Buat event
                    </EventLinkButton>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
              {result.list.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  href={`${baseHref}/${event.id}`}
                  manage
                />
              ))}
            </div>
          )}

          {result.totalPage > 1 && (
            <Pagination currentPage={result.currentPage} totalPages={result.totalPage} />
          )}
        </main>
      </PageMargin>
    </OfficialPageShell>
  );
}
