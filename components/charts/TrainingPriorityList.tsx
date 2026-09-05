"use client";

import { useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Factory,
  LoaderCircle,
} from "lucide-react";
import type { TrainingPriorities } from "@/apis/stat";
import Button from "../buttons/Button";

interface TrainingPriorityListProps {
  initialData: TrainingPriorities | null;
  entity: "branch" | "chapter";
  organizationId?: string;
  coordinatingBodyId?: string;
  branchId?: string;
  coordinatingChapterId?: string;
}

function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

export default function TrainingPriorityList({
  initialData,
  entity,
  organizationId,
  coordinatingBodyId,
  branchId,
  coordinatingChapterId,
}: TrainingPriorityListProps) {
  const scopeKey = [
    entity,
    organizationId,
    coordinatingBodyId,
    branchId,
    coordinatingChapterId,
  ].join(":");
  const [loadedData, setLoadedData] = useState<{
    initialData: TrainingPriorities | null;
    scopeKey: string;
    data: TrainingPriorities;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [failedScope, setFailedScope] = useState<string | null>(null);
  const data =
    loadedData?.initialData === initialData && loadedData.scopeKey === scopeKey
      ? loadedData.data
      : initialData;
  const loadFailed = failedScope === scopeKey;
  const isBranch = entity === "branch";
  const EntityIcon = isBranch ? Building2 : Factory;
  const entityLabel = isBranch ? "Cabang" : "Komisariat";
  const entries = data?.list ?? [];
  const currentPage = data?.metapaging.current_page ?? 1;
  const totalPages = data?.metapaging.total_page ?? 1;
  const totalData = data?.metapaging.total_data ?? entries.length;
  const firstItem = totalData === 0 ? 0 : (currentPage - 1) * 5 + 1;
  const lastItem = Math.min(firstItem + entries.length - 1, totalData);

  async function goToPage(page: number) {
    if (page === currentPage || page < 1 || page > totalPages || isLoading) {
      return;
    }

    const params = new URLSearchParams({
      entity,
      page: String(page),
    });
    if (organizationId) params.set("organization_id", organizationId);
    if (coordinatingBodyId) {
      params.set("coordinating_body_id", coordinatingBodyId);
    }
    if (branchId) params.set("branch_id", branchId);
    if (coordinatingChapterId) {
      params.set("coordinating_chapter_id", coordinatingChapterId);
    }

    setIsLoading(true);
    setFailedScope(null);
    try {
      const response = await fetch(
        `/api/stat/training-priorities?${params.toString()}`
      );
      if (!response.ok) throw new Error("Training priorities request failed");
      const payload = (await response.json()) as {
        data?: TrainingPriorities | null;
      };
      if (!payload.data) throw new Error("Training priorities data is missing");
      setLoadedData({ initialData, scopeKey, data: payload.data });
    } catch {
      setFailedScope(scopeKey);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <article
      aria-busy={isLoading}
      className="relative rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#172033]">
            Prioritas Pengkaderan
          </h3>
          <p className="text-sm leading-5 text-[#5f6573]">
            {entityLabel} persiapan dengan jumlah kader aktif paling sedikit
          </p>
        </div>
        {isLoading && (
          <LoaderCircle
            aria-label="Memuat prioritas pengkaderan"
            className="mt-0.5 size-4 shrink-0 animate-spin text-primary"
          />
        )}
      </div>

      {entries.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center text-center">
          <p className="text-sm text-[#5f6573]">
            Belum ada {entityLabel} yang menjadi prioritas pengkaderan.
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-[#eef0f4]">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <EntityIcon className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#172033]">
                  {entityLabel} {entry.name}
                </p>
                <p className="mt-0.5 text-xs text-[#5f6573]">
                  {isBranch && (
                    <>{formatNumber(entry.count_chapter ?? 0)} Komisariat · </>
                  )}
                  {formatNumber(entry.count_members)} kader aktif
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-secondary-soft px-2.5 py-1 text-[11px] font-semibold text-secondary">
                Persiapan
              </span>
            </div>
          ))}
        </div>
      )}

      {loadFailed && (
        <p className="mt-3 text-center text-xs text-destructive" role="alert">
          Data gagal dimuat. Silakan coba lagi.
        </p>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#eef0f4] pt-4">
          <p className="text-xs text-[#5f6573]">
            {firstItem}–{lastItem} dari {formatNumber(totalData)} data
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              aria-label="Halaman sebelumnya"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => goToPage(currentPage - 1)}
            >
              <ChevronLeft className="size-3.5" /> Prev
            </Button>
            <span className="min-w-14 text-center text-xs font-semibold text-[#172033]">
              {currentPage} / {totalPages}
            </span>
            <Button
              aria-label="Halaman selanjutnya"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
