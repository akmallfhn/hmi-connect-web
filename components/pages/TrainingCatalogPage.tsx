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
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { PagedTrainingResult, TrainingListEntry } from "@/apis/trainings";
import type { TrainingStatusEnum } from "@/lib/types";
import Button from "../buttons/Button";
import PageBanner from "../common/PageBanner";
import PageMargin from "../common/PageMargin";
import Pagination from "../common/Pagination";
import Dropdown from "../common/Dropdown";
import Input from "../fields/Input";
import EmptyStateIllustration from "../illustrations/EmptyStateIllustration";
import PublicTrainingCard from "../trainings/PublicTrainingCard";
import TrainingPageShell, {
  type TrainingViewer,
} from "../trainings/TrainingPageShell";

// Placeholder until the training banner photo is ready.
const BANNER_IMAGE_URL =
  "https://fkzvvwtrwpjsclpthqex.supabase.co/storage/v1/object/public/hmi-connect/assets/lk-hmi.webp";

interface TrainingCatalogPageProps {
  viewer: TrainingViewer;
  result: PagedTrainingResult<TrainingListEntry>;
  initialSearch: string;
  initialLevel?: TrainingStatusEnum;
}

const LEVELS: { label: string; value?: TrainingStatusEnum }[] = [
  { label: "Semua level", value: undefined },
  { label: "LK1", value: "LK1" },
  { label: "LK2", value: "LK2" },
  { label: "LK3", value: "LK3" },
];

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
  const activeFilterCount = [initialLevel].filter(Boolean).length;

  return (
    <TrainingPageShell viewer={viewer} mobileBackTitle="Training">
      <PageMargin className="pt-3 lg:pt-6">
        <main className="flex flex-col gap-3 lg:gap-6">
          <PageBanner className="bg-brand-deep">
            <div className="relative z-10 max-w-[60%] font-stack-sans-headline">
              <h1 className="text-[15px] font-medium leading-snug sm:text-xl lg:text-2xl">
                Training Center
              </h1>
              <p className="mt-1 text-[10px] text-on-dark/70 lg:flex lg:text-base">
                Jelajahi Latihan Kader dari berbagai daerah, simpan dan
                registrasi.
              </p>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[45%] [mask-image:linear-gradient(to_right,transparent,black)]">
              <Image
                src={BANNER_IMAGE_URL}
                alt=""
                fill
                sizes="(min-width: 1024px) 540px, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-media-backdrop/25" />
            </div>
          </PageBanner>

          <div className="flex items-center gap-2 lg:gap-3">
            <form onSubmit={handleSearch} className="min-w-0 flex-1">
              <Input
                inputId="training-search"
                type="search"
                aria-label="Cari training"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama training, kota, atau penyelenggara"
                icon={
                  <IconSearch className="size-4 text-subtle-foreground" stroke={2} />
                }
                className="h-11 rounded-full bg-surface pr-12 text-sm"
                trailing={
                  search ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        navigateWith({ search: undefined });
                      }}
                      aria-label="Hapus pencarian"
                      className="flex size-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-border-strong"
                    >
                      <IconX className="size-4" stroke={2} />
                    </button>
                  ) : undefined
                }
              />
            </form>

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
                  className="relative shrink-0 overflow-visible!"
                >
                  <IconFilter className="size-4" stroke={2} />
                  {activeFilterCount > 0 && (
                    <span
                      className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-badge-destructive px-1 text-[10px] font-semibold leading-none text-badge-foreground ring-2 ring-on-dark"
                      aria-label={`${activeFilterCount} filter aktif`}
                    >
                      {activeFilterCount > 9 ? "9+" : activeFilterCount}
                    </span>
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
                    className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-primary-soft hover:text-primary-foreground"
                  >
                    {level.label}
                    {initialLevel === level.value && (
                      <IconCheck className="size-4 text-primary-foreground" stroke={2} />
                    )}
                  </button>
                ))}
              </div>
            </Dropdown>
          </div>

          <div className="flex flex-col gap-4 pb-6 lg:pb-10">
            {hasFilters && (
              <button
                type="button"
                onClick={() => router.push("/trainings")}
                className="inline-flex h-9 self-start cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-muted-foreground transition hover:bg-surface hover:text-heading"
              >
                <IconRefresh className="size-3.5" stroke={2} />
                Reset pencarian dan filter
              </button>
            )}

            {result.list.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface px-5 text-center">
                <EmptyStateIllustration
                  className="h-auto w-40"
                  aria-hidden="true"
                />
                <div className="mt-4">
                  <p className="font-semibold text-heading">
                    Belum ada agenda yang cocok
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Coba level lain atau ubah kata kunci pencarianmu.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
                {result.list.map((training) => (
                  <PublicTrainingCard
                    key={training.id}
                    training={training}
                    isSignedIn={Boolean(viewer.userId)}
                  />
                ))}
              </div>
            )}

            {result.totalPage > 1 && (
              <div className="mt-5 flex flex-col items-center gap-3">
                <Pagination
                  currentPage={result.currentPage}
                  totalPages={result.totalPage}
                  previousIcon={
                    <IconChevronLeft className="size-4" stroke={2} />
                  }
                  nextIcon={<IconChevronRight className="size-4" stroke={2} />}
                />
              </div>
            )}
          </div>
        </main>
      </PageMargin>
    </TrainingPageShell>
  );
}
