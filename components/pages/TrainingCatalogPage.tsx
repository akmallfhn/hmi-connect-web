"use client";

import {
  CalendarPlus,
  CalendarRange,
  Funnel,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { PagedTrainingResult, TrainingListEntry } from "@/apis/trainings";
import type { TrainingStatusEnum } from "@/lib/types";
import PageMargin from "../common/PageMargin";
import Pagination from "../common/Pagination";
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

type DiscoveryCategory = "all" | "nearby" | "open" | "ongoing" | "lk1" | "lk2";

const CREATE_EVENT_CLASS =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-secondary px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(255,92,83,0.26)] transition hover:-translate-y-0.5 hover:bg-[#e6534b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/75";

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
  { id: "lk1", label: "Mulai dari LK1" },
  { id: "lk2", label: "Lanjut ke LK2" },
];

function CreateEventLink() {
  return (
    <Link href="/trainings/create" className={CREATE_EVENT_CLASS}>
      <CalendarPlus className="size-4" />
      Buat event
    </Link>
  );
}

function dateAtJakartaDay(value: string) {
  return new Date(`${value}T00:00:00+07:00`);
}

function matchesCategory(
  training: TrainingListEntry,
  category: DiscoveryCategory,
) {
  if (category === "all") return true;
  if (category === "open") return training.is_registration_open;
  if (category === "lk1") return training.level === "LK1";
  if (category === "lk2") return training.level === "LK2";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = dateAtJakartaDay(training.start_date);
  const endDate = dateAtJakartaDay(training.end_date);
  if (category === "ongoing") return startDate <= now && endDate >= now;

  const daysUntilStart =
    (startDate.getTime() - today.getTime()) / 86_400_000;
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
    matchesCategory(training, category),
  );

  return (
    <TrainingPageShell
      viewer={viewer}
      mobileBackTitle="Training"
      bgClassName="bg-[#f6f8fa]"
    >
      <main>
        <section className="relative overflow-hidden bg-[#073f4a] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_13%_0%,rgba(42,184,177,0.58),transparent_34%),radial-gradient(circle_at_95%_20%,rgba(255,150,101,0.45),transparent_29%),linear-gradient(118deg,#063f4a_0%,#0b6970_58%,#118b91_100%)]" />
          <div className="absolute -bottom-28 right-[8%] size-72 rounded-full border-[30px] border-white/10" />
          <div className="absolute left-[42%] top-8 size-20 rotate-12 rounded-3xl border border-white/15" />

          <PageMargin className="relative py-8 lg:py-12">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-sm">
                <Sparkles className="size-3.5 text-[#ffcf92]" />
                AGENDA PENGKADERAN HMI
              </p>
              <h1 className="font-stack-sans-headline mt-4 text-3xl font-medium leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
                Temukan ruang tumbuhmu.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                Jelajahi Latihan Kader dari berbagai daerah, simpan yang menarik, lalu bagikan ke teman seperjuangan.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-white/20 bg-white p-3 shadow-[0_18px_45px_rgba(1,41,48,0.26)] lg:mt-8 lg:flex lg:items-center lg:gap-3 lg:p-3.5">
              <form onSubmit={handleSearch} className="min-w-0 flex-1">
                <label className="relative block">
                  <span className="sr-only">Cari training</span>
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari nama training, kota, atau penyelenggara"
                    className="h-12 w-full rounded-xl bg-[#f3f7f8] pl-12 pr-10 text-sm text-[#172033] outline-none transition placeholder:text-[#7b8190] focus:bg-white focus:ring-2 focus:ring-primary/35"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        navigateWith({ search: undefined });
                      }}
                      aria-label="Hapus pencarian"
                      className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#6d7480] transition hover:bg-[#dbe3ef]"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </label>
              </form>

              <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-0.5 lg:mt-0 lg:shrink-0 lg:overflow-visible">
                <span className="inline-flex shrink-0 items-center gap-1.5 pl-1 text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  <Funnel className="size-3.5" />
                  Filter
                </span>
                {LEVELS.map((level) => {
                  const active = initialLevel === level.value;
                  return (
                    <button
                      key={level.label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => navigateWith({ level: level.value })}
                      className={`h-10 shrink-0 cursor-pointer rounded-xl border px-3.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                        active
                          ? "border-primary bg-primary text-white shadow-sm"
                          : "border-[#dbe3ef] bg-white text-[#41474e] hover:border-primary/50 hover:bg-primary-soft"
                      }`}
                    >
                      {level.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </PageMargin>
        </section>

        <PageMargin className="py-6 lg:py-9">
          <div className="flex flex-col gap-4 border-b border-[#e1e5ec] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Eksplor cepat</p>
              <h2 className="font-stack-sans-headline mt-1 text-2xl font-medium text-[#172033]">
                Agenda untuk langkah berikutnya
              </h2>
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <p className="text-sm text-[#667085]">{result.totalData} agenda tersedia</p>
              <CreateEventLink />
            </div>
          </div>

          <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
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
                    <span className={active ? "text-white/65" : "text-[#8992a0]"}>
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
              <RotateCcw className="size-3.5" />
              Reset pencarian dan filter
            </button>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#5f6573]">
              {category === "all"
                ? "Pilihan agenda yang bisa kamu ikuti"
                : `${visibleTrainings.length} agenda sesuai pilihanmu di halaman ini`}
            </p>
          </div>

          {visibleTrainings.length === 0 ? (
            <div className="mt-4 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cfd5df] bg-white px-5 text-center">
              <CalendarRange className="size-10 text-[#a0a6b2]" />
              <div className="mt-3">
                <p className="font-semibold text-[#172033]">Belum ada agenda yang cocok</p>
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
              <Pagination currentPage={result.currentPage} totalPages={result.totalPage} />
            </div>
          )}
        </PageMargin>
      </main>
    </TrainingPageShell>
  );
}
