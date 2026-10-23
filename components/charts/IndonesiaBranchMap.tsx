"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { LoaderCircle, Minus, Plus, RotateCcw, Search } from "lucide-react";
import type { BranchMapEntry } from "@/apis/stat";
import Input from "@/components/fields/Input";
import FilterDropdown from "@/components/common/FilterDropdown";
import ActiveFilterChips from "@/components/common/ActiveFilterChips";
import Select from "@/components/fields/Select";
import SearchableSelect from "@/components/fields/SearchableSelect";
import MapSquare from "@/components/svg/MapSquare";
import { useBranchMapViewport } from "@/hooks/useBranchMapViewport";
import { projectBranchMapPosition } from "@/lib/branch-map-coordinates";
import {
  branchMapPointKind,
  MAX_MAP_ZOOM,
  MIN_MAP_ZOOM,
} from "@/lib/branch-map-viewport";
import BranchMapPopover, { type BranchMapPoint } from "./BranchMapPopover";

type BranchMapSearchResult = {
  query: string;
  entries: BranchMapEntry[];
};

const MAP_POINT_STATES = {
  full: {
    label: "Cabang Penuh",
    color: "text-green-800",
    pulseColor: "bg-green-800/30",
    swatchColor: "bg-green-800",
  },
  provisional: {
    label: "Cabang Persiapan",
    color: "text-pink-600",
    pulseColor: "bg-pink-600/30",
    swatchColor: "bg-pink-600",
  },
  empty: {
    label: "Belum ada progres",
    color: "text-secondary",
    pulseColor: "bg-secondary/30",
    swatchColor: "bg-secondary",
  },
};

const STATUS_OPTIONS = [
  { label: "Semua Status", value: "" },
  ...Object.entries(MAP_POINT_STATES).map(([value, { label }]) => ({
    value,
    label,
  })),
];

function formatBranchName(name: string) {
  return /^(hmi\s+)?cabang\s+/i.test(name) ? name : `HMI Cabang ${name}`;
}

function formatCoordinatingBodyName(name: string | null) {
  if (!name) return "-";
  return name.replace(/^(hmi\s+)?badko\s+/i, "").trim() || "-";
}

function BranchPoint({
  point,
  x,
  y,
  visible,
  active,
  popoverId,
  onSelect,
}: {
  point: BranchMapPoint;
  x: number;
  y: number;
  visible: boolean;
  active: boolean;
  popoverId: string;
  onSelect: (id: string, anchor: HTMLButtonElement) => void;
}) {
  const kind = branchMapPointKind(
    point.totalVerifiedKader,
    point.totalChapters,
    point.type
  );
  const { color, pulseColor } = MAP_POINT_STATES[kind];
  const positionStyle = {
    left: x,
    top: y,
    visibility: visible ? ("visible" as const) : ("hidden" as const),
  };
  return (
    <>
      <span
        aria-hidden="true"
        style={positionStyle}
        className="pointer-events-none absolute z-0 size-5 -translate-x-1/2 -translate-y-1/2"
      >
        <span
          className={`block size-full animate-ping rounded-full motion-reduce:animate-none ${pulseColor}`}
        />
      </span>
      <button
        type="button"
        data-map-point
        aria-label={point.name}
        aria-haspopup="dialog"
        aria-expanded={active}
        aria-controls={active ? popoverId : undefined}
        tabIndex={visible ? 0 : -1}
        onClick={(event) => onSelect(point.id, event.currentTarget)}
        style={positionStyle}
        className={`absolute flex size-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? "z-20" : "z-10"}`}
      >
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          className={`pointer-events-none relative size-3.5 shrink-0 ${color}`}
        >
          <circle
            cx="7"
            cy="7"
            r="6"
            fill="currentColor"
            stroke="var(--on-dark)"
            strokeWidth="2"
          />
          <circle cx="7" cy="7" r="3" fill="var(--surface)" />
        </svg>
      </button>
    </>
  );
}

interface IndonesiaBranchMapProps {
  initialBranches: BranchMapEntry[];
  organizationId?: string;
  coordinatingBodyId?: string;
}

export default function IndonesiaBranchMap({
  initialBranches,
  organizationId,
  coordinatingBodyId,
}: IndonesiaBranchMapProps) {
  const [selected, setSelected] = useState<{
    id: string;
    anchor: HTMLButtonElement;
  } | null>(null);
  const closeDetails = useCallback(() => setSelected(null), []);
  const {
    viewportRef,
    view,
    size,
    dragging,
    transform,
    snapPoint,
    zoomBy,
    reset,
    handlers,
  } = useBranchMapViewport(closeDetails);
  const mapId = useId();
  const popoverId = `${mapId}-detail`;
  const instructionsId = `${mapId}-instructions`;
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] =
    useState<BranchMapSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const normalizedSearch = search.trim();
  const [badkoId, setBadkoId] = useState("");
  const [branchStatus, setBranchStatus] = useState("");
  const badkoOptions = useMemo(() => {
    const names = new Map<string, string>();
    for (const branch of initialBranches) {
      if (branch.coordinating_body_id) {
        names.set(
          branch.coordinating_body_id,
          formatCoordinatingBodyName(branch.coordinating_body_name)
        );
      }
    }
    return [...names]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "id"));
  }, [initialBranches]);
  const selectedBadko =
    badkoOptions.find((option) => option.value === badkoId) ?? null;
  const loadBadkoOptions = useCallback(
    async (input: string) => ({
      options: badkoOptions.filter((option) =>
        option.label
          .toLocaleLowerCase("id")
          .includes(input.toLocaleLowerCase("id"))
      ),
      hasMore: false,
    }),
    [badkoOptions]
  );
  function clearFilters() {
    setBadkoId("");
    setBranchStatus("");
    reset();
  }
  const branches = useMemo(
    () =>
      normalizedSearch
        ? searchResult?.query === normalizedSearch
          ? searchResult.entries
          : []
        : initialBranches,
    [initialBranches, normalizedSearch, searchResult]
  );
  const isSearchPending =
    Boolean(normalizedSearch) &&
    !searchFailed &&
    (isSearching || searchResult?.query !== normalizedSearch);

  useEffect(() => {
    if (!normalizedSearch) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchFailed(false);
      try {
        const params = new URLSearchParams({ q: normalizedSearch });
        if (organizationId) params.set("organization_id", organizationId);
        if (coordinatingBodyId) {
          params.set("coordinating_body_id", coordinatingBodyId);
        }
        const response = await fetch(`/api/stat/branch-map?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Branch map search failed");
        const payload = (await response.json()) as { data?: BranchMapEntry[] };
        setSearchResult({
          query: normalizedSearch,
          entries: payload.data ?? [],
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSearchFailed(true);
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [organizationId, coordinatingBodyId, normalizedSearch]);

  const points = useMemo(
    () =>
      branches.flatMap((branch): BranchMapPoint[] => {
        if (badkoId && branch.coordinating_body_id !== badkoId) return [];
        if (
          branchStatus &&
          branchMapPointKind(
            branch.verified_member_count,
            branch.chapter_count,
            branch.type
          ) !== branchStatus
        )
          return [];
        if (branch.latitude === null || branch.longitude === null) return [];
        const position = projectBranchMapPosition(
          branch.latitude,
          branch.longitude
        );
        if (!position) return [];
        return [
          {
            id: branch.id,
            name: formatBranchName(branch.name),
            x: position.x,
            y: position.y,
            coordinatingBodyName: formatCoordinatingBodyName(
              branch.coordinating_body_name
            ),
            type: branch.type,
            totalVerifiedKader: branch.verified_member_count,
            totalChapters: branch.chapter_count,
          },
        ];
      }),
    [branches, badkoId, branchStatus]
  );

  const filterChips = [
    ...(selectedBadko && !coordinatingBodyId
      ? [
          {
            key: "badko",
            label: "Badko",
            value: selectedBadko.label,
            onRemove: () => {
              setBadkoId("");
              reset();
            },
          },
        ]
      : []),
    ...(branchStatus
      ? [
          {
            key: "status",
            label: "Status Cabang",
            value:
              STATUS_OPTIONS.find((option) => option.value === branchStatus)
                ?.label ?? branchStatus,
            onRemove: () => {
              setBranchStatus("");
              reset();
            },
          },
        ]
      : []),
  ];

  const activePoint = selected
    ? points.find((point) => point.id === selected.id)
    : undefined;

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-base font-bold text-heading">
            Sebaran Kader HMI di Indonesia
          </p>
          <p className="text-sm text-muted-foreground">
            Klik atau ketuk titik Cabang untuk melihat ringkasan
          </p>
        </div>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div className="min-w-0 flex-1 sm:w-64">
            <Input
              inputId={`${mapId}-search`}
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                reset();
              }}
              placeholder="Cari Cabang"
              aria-label="Cari Cabang pada peta"
              icon={
                isSearchPending ? (
                  <LoaderCircle className="size-4 animate-spin text-primary-foreground" />
                ) : (
                  <Search className="size-4" />
                )
              }
              className="text-sm"
            />
          </div>
          <FilterDropdown
            panelId={`${mapId}-filters`}
            ariaLabel="Filter peta Cabang"
            activeCount={filterChips.length}
            onReset={clearFilters}
            align="end"
          >
            {!coordinatingBodyId && (
              <SearchableSelect
                selectId={`${mapId}-badko`}
                label="Badko"
                placeholder="Semua Badko"
                value={selectedBadko}
                defaultOptions={badkoOptions}
                loadOptions={loadBadkoOptions}
                onChange={(option) => {
                  setBadkoId(option ? String(option.value) : "");
                  reset();
                }}
                portalMenu={false}
              />
            )}
            <Select
              selectId={`${mapId}-status`}
              label="Status Cabang"
              placeholder="Semua Status"
              value={branchStatus || null}
              options={STATUS_OPTIONS}
              onChange={(value) => {
                setBranchStatus(String(value ?? ""));
                reset();
              }}
            />
          </FilterDropdown>
        </div>
      </div>
      <ActiveFilterChips chips={filterChips} onClearAll={clearFilters} />

      <div className="relative mt-5 overflow-hidden rounded-xl border border-border bg-surface-subtle">
        <div className="relative h-72 sm:h-auto sm:min-h-72 sm:aspect-[1600/690]">
          <div
            ref={viewportRef}
            role="region"
            aria-label="Peta persebaran Cabang HMI"
            aria-describedby={instructionsId}
            tabIndex={0}
            {...handlers}
            className={`absolute inset-0 touch-none overflow-hidden select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          >
            <MapSquare
              aria-label="Peta Indonesia"
              role="img"
              style={{
                width: transform.width,
                height: transform.height,
                transform: `translate(${transform.x}px, ${transform.y}px)`,
              }}
              className="pointer-events-none absolute left-0 top-0 max-w-none text-primary-foreground/55"
            />
            {points.map((point) => {
              const { x, y } = snapPoint({
                x: transform.x + (point.x / 100) * transform.width,
                y: transform.y + (point.y / 100) * transform.height,
              });
              return (
                <BranchPoint
                  key={point.id}
                  point={point}
                  x={x}
                  y={y}
                  visible={
                    size.width > 0 &&
                    x >= 0 &&
                    x <= size.width &&
                    y >= 0 &&
                    y <= size.height
                  }
                  active={selected?.id === point.id}
                  popoverId={popoverId}
                  onSelect={(id, anchor) =>
                    setSelected((previous) =>
                      previous?.id === id ? null : { id, anchor }
                    )
                  }
                />
              );
            })}
          </div>
          <span
            className="pointer-events-none absolute left-3 top-3 rounded-lg border border-border bg-surface/95 px-2 py-1 text-xs tabular-nums text-muted-foreground"
            aria-label="Tingkat zoom peta"
          >
            {Math.round(view.zoom * 100)}%
          </span>
          <div
            role="group"
            aria-label="Kontrol peta"
            className="absolute right-3 top-3 z-30 flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
          >
            <button
              type="button"
              aria-label="Perbesar peta"
              title="Perbesar peta"
              disabled={view.zoom >= MAX_MAP_ZOOM}
              onClick={() => zoomBy(2)}
              className="flex size-11 cursor-pointer items-center justify-center text-heading hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary disabled:cursor-default disabled:text-disabled-foreground"
            >
              <Plus className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Perkecil peta"
              title="Perkecil peta"
              disabled={view.zoom <= MIN_MAP_ZOOM}
              onClick={() => zoomBy(0.5)}
              className="flex size-11 cursor-pointer items-center justify-center border-y border-border text-heading hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary disabled:cursor-default disabled:text-disabled-foreground"
            >
              <Minus className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Reset tampilan peta"
              title="Reset tampilan peta"
              onClick={reset}
              className="flex size-11 cursor-pointer items-center justify-center text-heading hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
          {!isSearchPending &&
            (normalizedSearch || filterChips.length > 0) &&
            points.length === 0 && (
              <div
                role="status"
                className="pointer-events-none absolute inset-x-3 bottom-3 mx-auto w-fit max-w-full rounded-lg border border-border bg-surface/95 px-4 py-2 text-center text-xs font-medium text-muted-foreground shadow-sm"
              >
                {searchFailed
                  ? "Pencarian gagal dimuat. Coba lagi."
                  : "Cabang tidak ditemukan atau belum memiliki koordinat."}
              </div>
            )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border bg-surface px-3 py-3 text-xs text-muted-foreground sm:px-4">
          {Object.entries(MAP_POINT_STATES).map(([kind, state]) => (
            <span key={kind} className="inline-flex items-center gap-1.5">
              <span className={`size-2.5 rounded-full ${state.swatchColor}`} />
              {state.label}
              {kind === "empty" && (
                <span className="sr-only">
                  {" "}
                  (kader terverifikasi atau Komisariat masih 0)
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
      <p id={instructionsId} className="mt-2 text-xs text-muted-foreground">
        <span className="pointer-coarse:hidden">
          Geser untuk menjelajah. Klik dua kali atau Ctrl + scroll untuk zoom.
        </span>
        <span className="hidden pointer-coarse:inline">
          Cubit dengan dua jari untuk zoom. Geser untuk menjelajah.
        </span>
        <span className="sr-only">
          {" "}
          Gunakan tombol + atau - untuk zoom, tombol panah untuk menggeser, dan
          Home untuk reset.
        </span>
      </p>
      {selected && activePoint && (
        <BranchMapPopover
          point={activePoint}
          anchor={selected.anchor}
          id={popoverId}
          onClose={closeDetails}
        />
      )}
    </section>
  );
}
