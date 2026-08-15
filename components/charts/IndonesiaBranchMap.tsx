"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CircleDot,
  Factory,
  LoaderCircle,
  MapPin,
  Network,
  Search,
} from "lucide-react";
import type { BranchMapEntry } from "@/apis/stat";
import MapSquare from "@/components/svg/MapSquare";
import { projectBranchMapPosition } from "@/lib/branch-map-coordinates";

type BranchMapPoint = {
  id: string;
  name: string;
  x: number;
  y: number;
  coordinatingBodyName: string;
  type: BranchMapEntry["type"];
  totalVerifiedKader: number;
  totalChapters: number;
};

type BranchMapSearchResult = {
  query: string;
  entries: BranchMapEntry[];
};

function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

function formatBranchName(name: string) {
  return /^(hmi\s+)?cabang\s+/i.test(name) ? name : `HMI Cabang ${name}`;
}

function formatCoordinatingBodyName(name: string) {
  return name.replace(/^(hmi\s+)?badko\s+/i, "").trim() || "-";
}

function formatBranchType(type: BranchMapEntry["type"]) {
  return type === "full" ? "Penuh" : "Persiapan";
}

function BranchPoint({ point }: { point: BranchMapPoint }) {
  const isProvisional = point.type === "provisional";
  const horizontalPosition =
    point.x < 16
      ? "left-0"
      : point.x > 84
        ? "right-0"
        : "left-1/2 -translate-x-1/2";
  const verticalPosition = point.y < 35 ? "top-full mt-3" : "bottom-full mb-3";
  const tooltipId = `branch-map-tooltip-${point.id}`;

  return (
    <div
      className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 hover:z-20 focus-within:z-20"
      style={{ left: `${point.x}%`, top: `${point.y}%` }}
    >
      <button
        type="button"
        aria-describedby={tooltipId}
        aria-label={`${point.name}, ${point.coordinatingBodyName}, status ${formatBranchType(point.type)}: ${formatNumber(point.totalVerifiedKader)} kader terverifikasi dan ${formatNumber(point.totalChapters)} Komisariat`}
        className="relative flex size-8 cursor-pointer items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <span
          className={`absolute size-5 animate-ping rounded-full motion-reduce:animate-none ${
            isProvisional ? "bg-pink-500/45" : "bg-secondary/45"
          }`}
        />
        <span
          className={`relative flex size-4 items-center justify-center rounded-full border-2 border-white transition group-hover:scale-125 group-focus-within:scale-125 ${
            isProvisional
              ? "bg-pink-500 shadow-[0_3px_10px_rgba(236,72,153,0.45)]"
              : "bg-secondary shadow-[0_3px_10px_rgba(255,92,83,0.45)]"
          }`}
        >
          <span className="size-1.5 rounded-full bg-white" />
        </span>
      </button>

      <div
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none invisible absolute z-30 w-72 translate-y-1 rounded-xl border border-[#e6e9ef] bg-white p-3.5 opacity-0 shadow-[0_12px_32px_rgba(23,32,51,0.18)] transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 ${horizontalPosition} ${verticalPosition}`}
      >
        <div className="flex items-center gap-2">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary">
            <MapPin className="size-4" />
          </span>
          <p className="text-sm leading-5 font-bold text-[#172033]">
            {point.name}
          </p>
        </div>
        <div className="mt-3 space-y-2 border-t border-[#eef0f4] pt-3">
          <div className="flex items-start gap-2 text-[13px] text-[#5f6573]">
            <Network className="mt-0.5 size-3.5 shrink-0" />
            <span className="flex-1">Badko</span>
            <span className="max-w-36 text-right font-semibold text-[#172033]">
              {point.coordinatingBodyName}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#5f6573]">
            <CircleDot className="size-3.5" />
            <span className="flex-1">Status</span>
            <span className="font-semibold text-[#172033]">
              {formatBranchType(point.type)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#5f6573]">
            <BadgeCheck className="size-3.5" />
            <span className="flex-1">Kader Terverifikasi</span>
            <span className="font-semibold text-[#172033]">
              {formatNumber(point.totalVerifiedKader)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#5f6573]">
            <Factory className="size-3.5" />
            <span className="flex-1">Jumlah Komisariat</span>
            <span className="font-semibold text-[#172033]">
              {formatNumber(point.totalChapters)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface IndonesiaBranchMapProps {
  initialBranches: BranchMapEntry[];
  coordinatingBodyId?: string;
}

export default function IndonesiaBranchMap({
  initialBranches,
  coordinatingBodyId,
}: IndonesiaBranchMapProps) {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] =
    useState<BranchMapSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const normalizedSearch = search.trim();
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
  }, [coordinatingBodyId, normalizedSearch]);

  const points = useMemo(
    () =>
      branches.flatMap((branch): BranchMapPoint[] => {
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
    [branches]
  );

  return (
    <section className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-base font-bold text-[#172033]">
            Sebaran Kader HMI di Indonesia
          </p>
          <p className="text-sm text-[#5f6573]">
            Arahkan ke titik Cabang untuk melihat ringkasan
          </p>
        </div>

        <div className="w-full sm:w-64">
          <label htmlFor="branch-map-search" className="sr-only">
            Cari Cabang pada peta
          </label>
          <div className="relative">
            {isSearchPending ? (
              <LoaderCircle className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 animate-spin text-primary" />
            ) : (
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#7b8190]" />
            )}
            <input
              id="branch-map-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari Cabang"
              className="h-10 w-full rounded-xl border border-[#dbe3ef] bg-white pr-3 pl-10 text-sm text-[#172033] outline-none transition placeholder:text-[#9aa1ad] focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-primary/5">
        <div className="relative aspect-[1600/613] overflow-visible">
          <MapSquare
            aria-label="Peta Indonesia dengan titik persebaran Cabang HMI"
            role="img"
            className="absolute inset-0 size-full text-primary"
          />

          {points.map((point) => (
            <BranchPoint key={point.id} point={point} />
          ))}

          {!isSearchPending && normalizedSearch && points.length === 0 && (
            <div className="absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full border border-[#e6e9ef] bg-white/95 px-4 py-2 text-xs font-medium text-[#5f6573] shadow-sm">
              {searchFailed
                ? "Pencarian gagal dimuat. Coba lagi."
                : "Cabang tidak ditemukan atau belum memiliki koordinat."}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
