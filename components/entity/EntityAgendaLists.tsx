"use client";

import { useState, type ReactNode } from "react";
import type { EventListEntry, PagedEventResult } from "@/apis/events";
import type { PagedTrainingResult, TrainingListEntry } from "@/apis/trainings";
import { loadMoreEntityEvents, loadMoreEntityTrainings } from "@/lib/actions";
import type { MentionEntityTypeEnum } from "@/lib/types";
import Button from "../buttons/Button";
import EventCard from "../events/EventCard";
import PublicTrainingCard from "../trainings/PublicTrainingCard";

type AgendaPage<T> = {
  list: T[];
  totalData: number;
  currentPage: number;
  totalPage: number;
};

function AgendaGrid<T extends { id: string }>({
  label,
  dividedMobile = false,
  initialPage,
  loadPage,
  renderCard,
}: {
  label: string;
  dividedMobile?: boolean;
  initialPage: AgendaPage<T>;
  loadPage: (page: number) => Promise<AgendaPage<T>>;
  renderCard: (item: T) => ReactNode;
}) {
  const [items, setItems] = useState(initialPage.list);
  const [currentPage, setCurrentPage] = useState(initialPage.currentPage);
  const [totalPage, setTotalPage] = useState(initialPage.totalPage);
  const [totalData, setTotalData] = useState(initialPage.totalData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function loadMore() {
    if (loading || currentPage >= totalPage) return;
    setLoading(true);
    setError(false);
    try {
      const result = await loadPage(currentPage + 1);
      if (result.list.length === 0) {
        setError(true);
        return;
      }
      setItems((previous) => {
        const seen = new Set(previous.map((item) => item.id));
        return [...previous, ...result.list.filter((item) => !seen.has(item.id))];
      });
      setCurrentPage(result.currentPage);
      setTotalPage(result.totalPage);
      setTotalData(result.totalData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-w-0 border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
      <h2 className="font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]">
        {totalData.toLocaleString("id-ID")} {label}
      </h2>
      <div className={`mt-4 grid min-w-0 sm:grid-cols-2 sm:gap-4 ${dividedMobile ? "gap-0" : "gap-4"}`}>
        {items.map((item) => (
          <div
            key={item.id}
            className={`min-w-0 ${dividedMobile ? "border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0 sm:border-0 sm:p-0" : ""}`}
          >
            {renderCard(item)}
          </div>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-4 text-center text-sm text-destructive">
          Daftar belum berhasil dimuat. Coba lagi.
        </p>
      )}
      {currentPage < totalPage && (
        <div className="mt-5 flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? "Memuat..." : "Muat lebih banyak"}
          </Button>
        </div>
      )}
    </section>
  );
}

export function EntityEventList({
  entityType,
  entityId,
  initialPage,
}: {
  entityType: MentionEntityTypeEnum;
  entityId: string;
  initialPage: PagedEventResult;
}) {
  return (
    <AgendaGrid<EventListEntry>
      label="Event"
      dividedMobile
      initialPage={initialPage}
      loadPage={(page) => loadMoreEntityEvents(entityType, entityId, page)}
      renderCard={(event) => <EventCard event={event} compactMobile showActions={false} />}
    />
  );
}

export function EntityTrainingList({
  entityType,
  entityId,
  initialPage,
  isSignedIn,
}: {
  entityType: MentionEntityTypeEnum;
  entityId: string;
  initialPage: PagedTrainingResult<TrainingListEntry>;
  isSignedIn: boolean;
}) {
  return (
    <AgendaGrid<TrainingListEntry>
      label="Training"
      dividedMobile
      initialPage={initialPage}
      loadPage={(page) => loadMoreEntityTrainings(entityType, entityId, page)}
      renderCard={(training) => (
        <PublicTrainingCard training={training} isSignedIn={isSignedIn} compactMobile showActions={false} />
      )}
    />
  );
}
