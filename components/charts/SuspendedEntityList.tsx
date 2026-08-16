"use client";

import { useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Factory,
  LoaderCircle,
  Network,
  type LucideIcon,
} from "lucide-react";
import type {
  SuspendedEntities,
  SuspendedEntityEntry,
  SuspendedEntityType,
} from "@/apis/stat";
import Button from "../buttons/Button";

export type SuspendedEntityTab = {
  entityType: SuspendedEntityType;
  label: string;
  initialData: SuspendedEntities | null;
};

interface SuspendedEntityListProps {
  tabs: SuspendedEntityTab[];
  coordinatingBodyId?: string;
  branchId?: string;
  coordinatingChapterId?: string;
}

const ENTITY_CONFIG: Record<
  SuspendedEntityType,
  { label: string; icon: LucideIcon; prefixPattern: RegExp }
> = {
  coordinating_body: {
    label: "Badko",
    icon: Network,
    prefixPattern: /^(?:hmi\s+)?badko\s+/i,
  },
  branch: {
    label: "Cabang",
    icon: Building2,
    prefixPattern: /^(?:hmi\s+)?cabang\s+/i,
  },
  coordinating_chapter: {
    label: "Korkom",
    icon: Network,
    prefixPattern: /^(?:hmi\s+)?korkom\s+/i,
  },
  chapter: {
    label: "Komisariat",
    icon: Factory,
    prefixPattern: /^(?:hmi\s+)?komisariat\s+/i,
  },
};

function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

function formatEntityName(entityType: SuspendedEntityType, name: string) {
  const config = ENTITY_CONFIG[entityType];
  const normalizedName = name.replace(config.prefixPattern, "").trim();
  return `${config.label} ${normalizedName || name}`;
}

function getParentName(
  entityType: SuspendedEntityType,
  entry: SuspendedEntityEntry,
) {
  if (entityType === "coordinating_body") {
    return entry.organization_name ?? "Organisasi tidak tersedia";
  }
  if (entityType === "branch" && entry.coordinating_body_name) {
    return formatEntityName("coordinating_body", entry.coordinating_body_name);
  }
  if (entityType === "coordinating_chapter" && entry.branch_name) {
    return formatEntityName("branch", entry.branch_name);
  }
  if (entityType === "chapter") {
    if (entry.coordinating_chapter_name) {
      return formatEntityName(
        "coordinating_chapter",
        entry.coordinating_chapter_name,
      );
    }
    if (entry.branch_name) return formatEntityName("branch", entry.branch_name);
  }
  return "Informasi induk tidak tersedia";
}

export default function SuspendedEntityList({
  tabs,
  coordinatingBodyId,
  branchId,
  coordinatingChapterId,
}: SuspendedEntityListProps) {
  const scopeKey = [coordinatingBodyId, branchId, coordinatingChapterId].join(
    ":",
  );
  const [activeEntityType, setActiveEntityType] = useState(tabs[0].entityType);
  const [loadedData, setLoadedData] = useState<
    Partial<
      Record<
        SuspendedEntityType,
        {
          initialData: SuspendedEntities | null;
          scopeKey: string;
          data: SuspendedEntities;
        }
      >
    >
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [failedEntityType, setFailedEntityType] =
    useState<SuspendedEntityType | null>(null);
  const activeTab =
    tabs.find((tab) => tab.entityType === activeEntityType) ?? tabs[0];
  const loadedTabData = loadedData[activeTab.entityType];
  const data =
    loadedTabData?.initialData === activeTab.initialData &&
    loadedTabData.scopeKey === scopeKey
      ? loadedTabData.data
      : activeTab.initialData;
  const entries = data?.list ?? [];
  const currentPage = data?.metapaging.current_page ?? 1;
  const totalPages = data?.metapaging.total_page ?? 1;
  const totalData = data?.metapaging.total_data ?? entries.length;
  const pageSize = data?.metapaging.page_size ?? 5;
  const firstItem = totalData === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(firstItem + entries.length - 1, totalData);
  const EntityIcon = ENTITY_CONFIG[activeTab.entityType].icon;
  const title = `${tabs.map((tab) => tab.label).join(" & ")} Suspended`;
  const loadFailed = failedEntityType === activeTab.entityType;

  function selectTab(entityType: SuspendedEntityType) {
    if (entityType === activeEntityType || isLoading) return;
    setActiveEntityType(entityType);
    setFailedEntityType(null);
  }

  async function goToPage(page: number) {
    if (page === currentPage || page < 1 || page > totalPages || isLoading) {
      return;
    }

    const entityType = activeTab.entityType;
    const params = new URLSearchParams({
      entity_type: entityType,
      page: String(page),
    });
    if (coordinatingBodyId) {
      params.set("coordinating_body_id", coordinatingBodyId);
    }
    if (branchId) params.set("branch_id", branchId);
    if (coordinatingChapterId) {
      params.set("coordinating_chapter_id", coordinatingChapterId);
    }

    setIsLoading(true);
    setFailedEntityType(null);
    try {
      const response = await fetch(
        `/api/stat/suspended-entities?${params.toString()}`,
      );
      if (!response.ok) throw new Error("Suspended entities request failed");
      const payload = (await response.json()) as {
        data?: SuspendedEntities | null;
      };
      const nextData = payload.data;
      if (!nextData) throw new Error("Suspended entities data is missing");
      setLoadedData((current) => ({
        ...current,
        [entityType]: {
          initialData: activeTab.initialData,
          scopeKey,
          data: nextData,
        },
      }));
    } catch {
      setFailedEntityType(entityType);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <article
      aria-busy={isLoading}
      className="relative flex h-full flex-col rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#172033]">{title}</h3>
          <p className="text-sm leading-5 text-[#5f6573]">
            Entitas yang sedang berstatus tidak aktif
          </p>
        </div>
        {isLoading && (
          <LoaderCircle
            aria-label="Memuat entitas tidak aktif"
            className="mt-0.5 size-4 shrink-0 animate-spin text-primary"
          />
        )}
      </div>

      {tabs.length > 1 && (
        <div
          role="tablist"
          aria-label="Jenis entitas tidak aktif"
          className="mt-4 inline-flex w-fit self-start rounded-full bg-[#f5f7fb] p-1"
        >
          {tabs.map((tab) => {
            const isActive = activeEntityType === tab.entityType;
            return (
              <button
                key={tab.entityType}
                id={`suspended-tab-${tab.entityType}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`suspended-panel-${tab.entityType}`}
                disabled={isLoading}
                onClick={() => selectTab(tab.entityType)}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  isActive
                    ? "bg-white text-primary shadow-sm"
                    : "text-[#5f6573] hover:text-[#172033]"
                }`}
              >
                {tab.label}
                <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                  {formatNumber(tab.initialData?.metapaging.total_data ?? 0)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div
        id={`suspended-panel-${activeTab.entityType}`}
        role={tabs.length > 1 ? "tabpanel" : undefined}
        aria-labelledby={
          tabs.length > 1 ? `suspended-tab-${activeTab.entityType}` : undefined
        }
        className="flex flex-1 flex-col"
      >
        {entries.length === 0 ? (
          <div className="flex min-h-40 flex-1 items-center justify-center text-center">
            <p className="text-sm text-[#5f6573]">
              Tidak ada {activeTab.label.toLowerCase()} yang suspended.
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
                    {formatEntityName(activeTab.entityType, entry.name)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#5f6573]">
                    {getParentName(activeTab.entityType, entry)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-destructive-soft px-2.5 py-1 text-[11px] font-semibold text-destructive">
                  Tidak Aktif
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

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
