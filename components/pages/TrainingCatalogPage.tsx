"use client";

import {
  CalendarRange,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { PagedTrainingResult, TrainingListEntry } from "@/apis/trainings";
import type {
  TrainingOrganizerTypeEnum,
  TrainingStatusEnum,
} from "@/lib/types";
import Button from "../buttons/Button";
import PageMargin from "../common/PageMargin";
import Pagination from "../common/Pagination";
import Select from "../fields/Select";
import PublicTrainingCard from "../trainings/PublicTrainingCard";
import TrainingPageShell, {
  type TrainingViewer,
} from "../trainings/TrainingPageShell";

interface TrainingCatalogPageProps {
  viewer: TrainingViewer;
  result: PagedTrainingResult<TrainingListEntry>;
  initialSearch: string;
  initialLevel?: TrainingStatusEnum;
  initialOrganizerType?: TrainingOrganizerTypeEnum;
}

const LEVELS: { label: string; value?: TrainingStatusEnum }[] = [
  { label: "Semua", value: undefined },
  { label: "LK1", value: "LK1" },
  { label: "LK2", value: "LK2" },
  { label: "LK3", value: "LK3" },
];

const ORGANIZER_OPTIONS = [
  { label: "Semua penyelenggara", value: null },
  { label: "Komisariat", value: "chapter" },
  { label: "Cabang", value: "branch" },
  { label: "Badko", value: "coordinating_body" },
  { label: "Organisasi", value: "organization" },
];

export default function TrainingCatalogPage({
  viewer,
  result,
  initialSearch,
  initialLevel,
  initialOrganizerType,
}: TrainingCatalogPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [seenSearch, setSeenSearch] = useState(initialSearch);

  if (seenSearch !== initialSearch) {
    setSeenSearch(initialSearch);
    setSearch(initialSearch);
  }

  function navigateWith(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.set("page", "1");
    const query = params.toString();
    router.push(query ? `/trainings?${query}` : "/trainings");
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigateWith({ search: search.trim() || undefined });
  }

  const hasFilters = Boolean(
    initialSearch || initialLevel || initialOrganizerType
  );

  return (
    <TrainingPageShell
      viewer={viewer}
      mobileBackTitle="Training"
      bgClassName="bg-white lg:bg-[#f5f7fb]"
    >
      <main>
        {/* Mobile-only: search + LK level filter below Header's back+title row. */}
        <div className="border-y border-[#e1e5ec] bg-white px-4 py-3 lg:hidden">
          <form onSubmit={handleSearch} className="min-w-0">
            <label className="relative block">
              <span className="sr-only">Cari training</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7b8190]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama training..."
                className="h-11 w-full rounded-full border border-[#dbe3ef] bg-[#f5f7fb] pl-10 pr-9 text-sm text-[#172033] outline-none transition placeholder:text-[#7b8190] focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    navigateWith({ search: undefined });
                  }}
                  aria-label="Hapus pencarian"
                  className="absolute right-2.5 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#dbe3ef] text-[#5f6573] transition hover:bg-[#c9d1de]"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </label>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {LEVELS.map((level) => {
              const active = initialLevel === level.value;
              return (
                <button
                  key={level.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => navigateWith({ level: level.value })}
                  className={`h-8 cursor-pointer rounded-full border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    active
                      ? "border-primary bg-primary text-white"
                      : "border-[#dbe3ef] bg-white text-[#41474e] hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  {level.label}
                </button>
              );
            })}
            {hasFilters && (
              <button
                type="button"
                onClick={() => router.push("/trainings")}
                className="ml-auto flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-[#5f6573] transition hover:bg-[#f5f7fb] hover:text-[#172033]"
              >
                <RotateCcw className="size-3.5" />
                Reset
              </button>
            )}
          </div>

          <p className="mt-3 text-sm font-medium text-[#5f6573]">
            {result.totalData} Latihan Kader ditemukan
          </p>
        </div>

        {/* Desktop-only: original title + inline search/filters layout. */}
        <div className="hidden border-b border-[#e1e5ec] bg-white lg:block">
          <PageMargin className="py-7 lg:py-9">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <CalendarRange className="size-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">
                  Training HMI
                </h1>
                <p className="mt-1 text-sm text-[#5f6573] sm:text-base">
                  Agenda Latihan Kader dari berbagai tingkat penyelenggara.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
              <form onSubmit={handleSearch} className="flex min-w-0 gap-2">
                <label className="relative min-w-0 flex-1">
                  <span className="sr-only">Cari training</span>
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7b8190]" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari nama training..."
                    className="h-11 w-full rounded-lg border border-[#dbe3ef] bg-white pl-10 pr-3 text-sm text-[#172033] outline-none transition placeholder:text-[#7b8190] focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </label>
                <Button type="submit" className="h-11 shrink-0 px-4">
                  <Search className="size-4" />
                  <span className="hidden sm:inline">Cari</span>
                </Button>
              </form>

              <Select
                selectId="training-organizer-filter"
                icon={<SlidersHorizontal className="size-4" />}
                placeholder="Semua penyelenggara"
                value={initialOrganizerType ?? null}
                options={ORGANIZER_OPTIONS}
                onChange={(value) =>
                  navigateWith({
                    organizer_type:
                      typeof value === "string" ? value : undefined,
                  })
                }
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-semibold uppercase text-[#7b8190]">
                Tingkat
              </span>
              {LEVELS.map((level) => {
                const active = initialLevel === level.value;
                return (
                  <button
                    key={level.label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => navigateWith({ level: level.value })}
                    className={`h-8 cursor-pointer rounded-full border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      active
                        ? "border-primary bg-primary text-white"
                        : "border-[#dbe3ef] bg-white text-[#41474e] hover:border-primary/50 hover:text-primary"
                    }`}
                  >
                    {level.label}
                  </button>
                );
              })}
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => router.push("/trainings")}
                  className="ml-auto flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-[#5f6573] transition hover:bg-[#f5f7fb] hover:text-[#172033]"
                >
                  <RotateCcw className="size-3.5" />
                  Reset
                </button>
              )}
            </div>
          </PageMargin>
        </div>

        <PageMargin className="pt-2 lg:py-8" noMobilePadding>
          <div className="mb-4 hidden items-center justify-between gap-3 lg:flex">
            <p className="text-sm font-medium text-[#5f6573]">
              {result.totalData} training ditemukan
            </p>
          </div>

          {result.list.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 border-y border-dashed border-[#cfd5df] bg-white px-5 text-center">
              <CalendarRange className="size-10 text-[#a0a6b2]" />
              <div>
                <p className="font-semibold text-[#172033]">
                  Training tidak ditemukan
                </p>
                <p className="mt-1 text-sm text-[#5f6573]">
                  Ubah kata kunci atau filter yang dipilih.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-5 xl:grid-cols-3">
              {result.list.map((training) => (
                <PublicTrainingCard key={training.id} training={training} />
              ))}
            </div>
          )}

          {result.totalPage > 1 && (
            <div className="mt-8 flex flex-col items-center gap-3 px-4 lg:px-0">
              <Pagination
                currentPage={result.currentPage}
                totalPages={result.totalPage}
              />
            </div>
          )}
        </PageMargin>
      </main>
    </TrainingPageShell>
  );
}
