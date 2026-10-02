"use client";

import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconRefresh,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { PagedTrainingResult, TrainingListEntry } from "@/apis/trainings";
import type { TrainingStatusEnum } from "@/lib/types";
import Button from "../buttons/Button";
import PageMargin from "../common/PageMargin";
import Pagination from "../common/Pagination";
import Dropdown from "../common/Dropdown";
import Input from "../fields/Input";
import EmptyStateIllustration from "../illustrations/EmptyStateIllustration";
import PublicTrainingCard from "../trainings/PublicTrainingCard";
import TrainingPageShell, {
  type TrainingViewer,
} from "../trainings/TrainingPageShell";

interface TrainingCatalogPageProps {
  viewer: TrainingViewer;
  result: PagedTrainingResult<TrainingListEntry>;
  initialSearch: string;
  initialLevel?: TrainingStatusEnum;
}

type DiscoveryCategory = "all" | "nearby" | "open" | "ongoing";

const LEVELS: { label: string; value?: TrainingStatusEnum }[] = [
  { label: "Semua level", value: undefined },
  { label: "LK1", value: "LK1" },
  { label: "LK2", value: "LK2" },
  { label: "LK3", value: "LK3" },
];

const DISCOVERY_CATEGORIES: {
  id: DiscoveryCategory;
  label: string;
  description?: string;
}[] = [
  { id: "all", label: "Semua agenda" },
  { id: "nearby", label: "Terdekat", description: "7 hari" },
  { id: "open", label: "Pendaftaran dibuka" },
  { id: "ongoing", label: "Sedang berlangsung" },
];

function dateAtJakartaDay(value: string) {
  return new Date(`${value}T00:00:00+07:00`);
}

function matchesCategory(
  training: TrainingListEntry,
  category: DiscoveryCategory
) {
  if (category === "all") return true;
  if (category === "open") return training.is_registration_open;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = dateAtJakartaDay(training.start_date);
  const endDate = dateAtJakartaDay(training.end_date);
  if (category === "ongoing") return startDate <= now && endDate >= now;

  const daysUntilStart = (startDate.getTime() - today.getTime()) / 86_400_000;
  return daysUntilStart >= 0 && daysUntilStart <= 7;
}

export default function TrainingCatalogPage({
  viewer,
  result,
  initialSearch,
  initialLevel,
}: TrainingCatalogPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [seenSearch, setSeenSearch] = useState(initialSearch);
  const [category, setCategory] = useState<DiscoveryCategory>("all");

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

  const hasFilters = Boolean(initialSearch || initialLevel);
  const visibleTrainings = result.list.filter((training) =>
    matchesCategory(training, category)
  );

  return (
    <TrainingPageShell
      viewer={viewer}
      mobileBackTitle="Training"
      bgClassName="bg-[#f6f8fa]"
    >
      <main>
        <section className="relative overflow-hidden bg-[#f6f8fa] text-white">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[calc(100%-4.25rem)] bg-[linear-gradient(118deg,#063f4a_0%,#0b6970_58%,#118b91_100%)] lg:h-[calc(100%-5.5rem)]" />

          <PageMargin className="relative py-8 lg:py-12">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="font-stack-sans-headline text-2xl font-medium leading-[1.08] tracking-tight sm:text-4xl lg:text-4xl">
                Training Center
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                Jelajahi Latihan Kader dari berbagai daerah, simpan dan
                registrasi.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-[#cfd5df] bg-white p-2 lg:mt-8 lg:p-2.5">
              <form onSubmit={handleSearch} className="min-w-0 flex-1">
                <div>
                  <Input
                    inputId="training-search"
                    type="search"
                    aria-label="Cari training"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari nama training, kota, atau penyelenggara"
                    icon={
                      <IconSearch className="size-5 text-primary" stroke={2} />
                    }
                    className="h-12 rounded-xl bg-[#f3f7f8] pr-12 text-sm focus:bg-white"
                    trailing={
                      search ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            navigateWith({ search: undefined });
                          }}
                          aria-label="Hapus pencarian"
                          className="flex size-7 cursor-pointer items-center justify-center rounded-full text-[#6d7480] transition hover:bg-[#dbe3ef]"
                        >
                          <IconX className="size-4" stroke={2} />
                        </button>
                      ) : undefined
                    }
                  />
                </div>
              </form>
            </div>
          </PageMargin>
        </section>

        <PageMargin className="pb-6 lg:pb-8">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            <Dropdown
              align="left"
              panelClassName="w-56 rounded-xl"
              trigger={({ open, toggle }) => (
                <Button
                  onClick={toggle}
                  aria-expanded={open}
                  aria-label="Filter level training"
                  title="Filter level"
                  variant="outline"
                  size="icon"
                  className="relative shrink-0 rounded-full border-[#dce2ea] bg-white text-[#4a5565] hover:border-primary/45 hover:text-primary"
                >
                  <IconFilter className="size-4" stroke={2} />
                  {initialLevel && (
                    <span
                      className="absolute right-1 top-1 size-2.5 rounded-full bg-destructive ring-2 ring-white"
                      aria-label="Filter aktif"
                    />
                  )}
                </Button>
              )}
            >
              <div
                className="p-1.5"
                role="group"
                aria-label="Pilih level training"
              >
                {LEVELS.map((level) => (
                  <button
                    key={level.label}
                    type="button"
                    aria-pressed={initialLevel === level.value}
                    onClick={() => navigateWith({ level: level.value })}
                    className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-[#41474e] transition hover:bg-primary-soft hover:text-primary"
                  >
                    {level.label}
                    {initialLevel === level.value && (
                      <IconCheck className="size-4 text-primary" stroke={2} />
                    )}
                  </button>
                ))}
              </div>
            </Dropdown>
            {DISCOVERY_CATEGORIES.map((item) => {
              const active = category === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(item.id)}
                  className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    active
                      ? "border-[#172033] bg-[#172033] text-white"
                      : "border-[#dce2ea] bg-white text-[#4a5565] hover:border-primary/45 hover:text-primary"
                  }`}
                >
                  {item.label}
                  {item.description && (
                    <span
                      className={active ? "text-white/65" : "text-[#8992a0]"}
                    >
                      · {item.description}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={() => router.push("/trainings")}
              className="mt-4 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-[#5f6573] transition hover:bg-white hover:text-[#172033]"
            >
              <IconRefresh className="size-3.5" stroke={2} />
              Reset pencarian dan filter
            </button>
          )}

          {visibleTrainings.length === 0 ? (
            <div className="mt-4 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cfd5df] bg-white px-5 text-center">
              <EmptyStateIllustration
                className="h-auto w-40"
                aria-hidden="true"
              />
              <div className="mt-4">
                <p className="font-semibold text-[#172033]">
                  Belum ada agenda yang cocok
                </p>
                <p className="mt-1 text-sm text-[#5f6573]">
                  Coba kategori lain atau ubah kata kunci pencarianmu.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
              {visibleTrainings.map((training) => (
                <PublicTrainingCard
                  key={training.id}
                  training={training}
                  isSignedIn={Boolean(viewer.userId)}
                />
              ))}
            </div>
          )}

          {result.totalPage > 1 && (
            <div className="mt-9 flex flex-col items-center gap-3">
              <Pagination
                currentPage={result.currentPage}
                totalPages={result.totalPage}
                previousIcon={<IconChevronLeft className="size-4" stroke={2} />}
                nextIcon={<IconChevronRight className="size-4" stroke={2} />}
              />
            </div>
          )}
        </PageMargin>
      </main>
    </TrainingPageShell>
  );
}
