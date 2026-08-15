"use client";

import { BadgeCheck, MapPin, Users } from "lucide-react";
import MapSquare from "@/components/svg/MapSquare";

type BranchMapPoint = {
  id: string;
  name: string;
  x: number;
  y: number;
  totalActiveKader: number;
  totalVerifiedKader: number;
};

const SAMPLE_BRANCHES: BranchMapPoint[] = [
  {
    id: "banda-aceh",
    name: "Cabang Banda Aceh",
    x: 8,
    y: 17,
    totalActiveKader: 428,
    totalVerifiedKader: 312,
  },
  {
    id: "medan",
    name: "Cabang Medan",
    x: 14,
    y: 30,
    totalActiveKader: 617,
    totalVerifiedKader: 455,
  },
  {
    id: "jakarta-selatan",
    name: "Cabang Jakarta Selatan",
    x: 31,
    y: 73,
    totalActiveKader: 894,
    totalVerifiedKader: 702,
  },
  {
    id: "yogyakarta",
    name: "Cabang Yogyakarta",
    x: 42,
    y: 76,
    totalActiveKader: 563,
    totalVerifiedKader: 441,
  },
  {
    id: "surabaya",
    name: "Cabang Surabaya",
    x: 53,
    y: 77,
    totalActiveKader: 731,
    totalVerifiedKader: 588,
  },
  {
    id: "banjarmasin",
    name: "Cabang Banjarmasin",
    x: 51,
    y: 55,
    totalActiveKader: 346,
    totalVerifiedKader: 241,
  },
  {
    id: "makassar",
    name: "Cabang Makassar",
    x: 68,
    y: 61,
    totalActiveKader: 522,
    totalVerifiedKader: 398,
  },
  {
    id: "jayapura",
    name: "Cabang Jayapura",
    x: 92,
    y: 49,
    totalActiveKader: 187,
    totalVerifiedKader: 126,
  },
];

function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

function BranchPoint({ point }: { point: BranchMapPoint }) {
  const horizontalPosition =
    point.x < 16
      ? "left-0"
      : point.x > 84
        ? "right-0"
        : "left-1/2 -translate-x-1/2";
  const verticalPosition =
    point.y < 35 ? "top-full mt-3" : "bottom-full mb-3";
  const tooltipId = `branch-map-tooltip-${point.id}`;

  return (
    <div
      className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 hover:z-20 focus-within:z-20"
      style={{ left: `${point.x}%`, top: `${point.y}%` }}
    >
      <button
        type="button"
        aria-describedby={tooltipId}
        aria-label={`${point.name}: ${formatNumber(point.totalActiveKader)} kader aktif dan ${formatNumber(point.totalVerifiedKader)} kader terverifikasi`}
        className="relative flex size-8 cursor-pointer items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <span className="absolute size-5 animate-ping rounded-full bg-secondary/45 motion-reduce:animate-none" />
        <span className="relative flex size-4 items-center justify-center rounded-full border-2 border-white bg-secondary shadow-[0_3px_10px_rgba(255,92,83,0.45)] transition group-hover:scale-125 group-focus-within:scale-125">
          <span className="size-1.5 rounded-full bg-white" />
        </span>
      </button>

      <div
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none invisible absolute z-30 w-56 translate-y-1 rounded-xl border border-[#e6e9ef] bg-white p-3.5 opacity-0 shadow-[0_12px_32px_rgba(23,32,51,0.18)] transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 ${horizontalPosition} ${verticalPosition}`}
      >
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary">
            <MapPin className="size-3.5" />
          </span>
          <p className="text-sm leading-5 font-bold text-[#172033]">
            {point.name}
          </p>
        </div>
        <div className="mt-3 space-y-2 border-t border-[#eef0f4] pt-3">
          <div className="flex items-center gap-2 text-xs">
            <Users className="size-3.5 text-primary" />
            <span className="flex-1 text-[#5f6573]">Total Kader Aktif</span>
            <span className="font-bold text-[#172033]">
              {formatNumber(point.totalActiveKader)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <BadgeCheck className="size-3.5 text-[#0ca30c]" />
            <span className="flex-1 text-[#5f6573]">
              Total Kader Terverifikasi
            </span>
            <span className="font-bold text-[#172033]">
              {formatNumber(point.totalVerifiedKader)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IndonesiaBranchMap() {
  return (
    <section className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-[#172033]">
            Sebaran Kader HMI di Indonesia
          </p>
          <p className="text-sm text-[#5f6573]">
            Arahkan kursor atau pilih titik Cabang untuk melihat ringkasan
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#5f6573]">
            <span className="size-2.5 rounded-full bg-secondary" />
            Titik Cabang
          </span>
          <span className="rounded-full bg-secondary-soft px-2.5 py-1 text-[11px] font-semibold text-secondary">
            Data sample
          </span>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl bg-primary/5">
        <div className="relative aspect-[1600/613] min-w-[720px] overflow-hidden">
          <MapSquare
            aria-label="Peta Indonesia dengan titik persebaran Cabang HMI"
            role="img"
            className="absolute inset-0 size-full text-primary"
          />

          {SAMPLE_BRANCHES.map((point) => (
            <BranchPoint key={point.id} point={point} />
          ))}
        </div>
      </div>
    </section>
  );
}
