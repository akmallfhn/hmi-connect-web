"use client";

import { useState } from "react";
import { Building2, Network } from "lucide-react";
import type { TrainingPriorities } from "@/apis/stat";
import TrainingPriorityList from "./TrainingPriorityList";

type SuspendedEntity = {
  name: string;
  region: string;
};

type SuspendedScope = "branch" | "coordinating-body";

const SUSPENDED_BRANCHES: SuspendedEntity[] = [
  { name: "Cabang Sabang", region: "Badko Aceh" },
  { name: "Cabang Palopo", region: "Badko Sulawesi Selatan dan Barat" },
  { name: "Cabang Sorong", region: "Badko Papua Barat" },
  { name: "Cabang Parepare", region: "Badko Sulawesi Selatan dan Barat" },
];

const SUSPENDED_COORDINATING_BODIES: SuspendedEntity[] = [
  { name: "Badko Papua Barat", region: "Wilayah Papua Barat" },
  { name: "Badko Maluku Utara", region: "Wilayah Maluku Utara" },
  { name: "Badko Kepulauan Riau", region: "Wilayah Kepulauan Riau" },
];

const LOW_CHAPTER_BRANCHES = [
  { name: "Cabang Ternate", totalChapters: 4, totalActiveKader: 97 },
  { name: "Cabang Cirebon", totalChapters: 9, totalActiveKader: 214 },
  { name: "Cabang Tanjung Selor", totalChapters: 0, totalActiveKader: 41 },
  { name: "Cabang Lhokseumawe", totalChapters: 8, totalActiveKader: 186 },
  { name: "Cabang Wamena", totalChapters: 1, totalActiveKader: 24 },
  { name: "Cabang Mamuju", totalChapters: 6, totalActiveKader: 121 },
  { name: "Cabang Singkawang", totalChapters: 2, totalActiveKader: 58 },
]
  .filter((branch) => branch.totalChapters < 10)
  .sort((a, b) => a.totalChapters - b.totalChapters);

const LOWEST_KADER_BRANCHES = [
  { name: "Cabang Mamuju", totalChapters: 6, totalActiveKader: 121 },
  { name: "Cabang Singkawang", totalChapters: 2, totalActiveKader: 58 },
  { name: "Cabang Lhokseumawe", totalChapters: 8, totalActiveKader: 186 },
  { name: "Cabang Tanjung Selor", totalChapters: 0, totalActiveKader: 41 },
  { name: "Cabang Ternate", totalChapters: 4, totalActiveKader: 97 },
  { name: "Cabang Wamena", totalChapters: 1, totalActiveKader: 24 },
].sort((a, b) => a.totalActiveKader - b.totalActiveKader);

const SUSPENDED_BY_SCOPE: Record<SuspendedScope, SuspendedEntity[]> = {
  branch: SUSPENDED_BRANCHES,
  "coordinating-body": SUSPENDED_COORDINATING_BODIES,
};

function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

interface CardHeaderProps {
  title: string;
  description: string;
}

function CardHeader({ title, description }: CardHeaderProps) {
  return (
    <div className="min-w-0">
      <h3 className="text-base font-bold text-[#172033]">{title}</h3>
      <p className="text-sm leading-5 text-[#5f6573]">{description}</p>
    </div>
  );
}

function EntityIcon({
  type = "branch",
}: {
  type?: "branch" | "coordinating-body";
}) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
      {type === "branch" ? (
        <Building2 className="size-3.5" />
      ) : (
        <Network className="size-3.5" />
      )}
    </span>
  );
}

function SuspendedEntityList() {
  const [activeScope, setActiveScope] = useState<SuspendedScope>("branch");
  const entries = SUSPENDED_BY_SCOPE[activeScope];

  return (
    <article className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <CardHeader
        title="Cabang & Badko Suspended"
        description="Entitas yang sedang berstatus tidak aktif"
      />

      <div
        role="tablist"
        aria-label="Jenis entitas suspended"
        className="mt-4 inline-flex rounded-full bg-[#f5f7fb] p-1"
      >
        {(
          [
            {
              value: "branch",
              label: "Cabang",
              total: SUSPENDED_BRANCHES.length,
            },
            {
              value: "coordinating-body",
              label: "Badko",
              total: SUSPENDED_COORDINATING_BODIES.length,
            },
          ] satisfies { value: SuspendedScope; label: string; total: number }[]
        ).map((tab) => {
          const isActive = activeScope === tab.value;
          return (
            <button
              key={tab.value}
              id={`suspended-tab-${tab.value}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`suspended-panel-${tab.value}`}
              onClick={() => setActiveScope(tab.value)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                isActive
                  ? "bg-white text-primary shadow-sm"
                  : "text-[#5f6573] hover:text-[#172033]"
              }`}
            >
              {tab.label}
              <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {tab.total}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id={`suspended-panel-${activeScope}`}
        role="tabpanel"
        aria-labelledby={`suspended-tab-${activeScope}`}
        className="mt-4 divide-y divide-[#eef0f4]"
      >
        {entries.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <EntityIcon
              type={activeScope === "branch" ? "branch" : "coordinating-body"}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#172033]">
                {entry.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-[#5f6573]">
                {entry.region}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-destructive-soft px-2.5 py-1 text-[11px] font-semibold text-destructive">
              Tidak Aktif
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function LowChapterList() {
  return (
    <article className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <CardHeader
        title="Cabang dengan Komisariat Paling Sedikit"
        description="Cabang dengan kurang dari 10 Komisariat, diurutkan paling sedikit"
      />

      <div className="mt-4 divide-y divide-[#eef0f4]">
        {LOW_CHAPTER_BRANCHES.map((branch) => (
          <div
            key={branch.name}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <EntityIcon />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#172033]">
                {branch.name}
              </p>
              <p className="mt-0.5 text-xs text-[#5f6573]">
                {formatNumber(branch.totalActiveKader)} kader aktif
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary">
              {branch.totalChapters === 0
                ? "Tanpa Komisariat"
                : `${formatNumber(branch.totalChapters)} Komisariat`}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function LowestKaderList() {
  return (
    <article className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <CardHeader
        title="Jumlah Kader di Masing-masing Cabang"
        description="Diurutkan dari jumlah kader aktif paling sedikit"
      />

      <div className="mt-4 divide-y divide-[#eef0f4]">
        {LOWEST_KADER_BRANCHES.map((branch) => (
          <div
            key={branch.name}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <EntityIcon />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#172033]">
                {branch.name}
              </p>
              <p className="mt-0.5 text-xs text-[#5f6573]">
                {formatNumber(branch.totalChapters)} Komisariat
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-[#172033]">
                {formatNumber(branch.totalActiveKader)}
              </p>
              <p className="text-[10px] text-[#5f6573]">Kader Aktif</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

interface MasterAttentionListsProps {
  trainingPriorities: TrainingPriorities | null;
  showSampleLists?: boolean;
}

export default function MasterAttentionLists({
  trainingPriorities,
  showSampleLists = false,
}: MasterAttentionListsProps) {
  return (
    <section aria-labelledby="master-attention-title">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="master-attention-title"
            className="text-base font-bold text-[#172033]"
          >
            Data yang Perlu Perhatian
          </h2>
          <p className="mt-0.5 text-xs text-[#5f6573]">
            Ringkasan entitas yang membutuhkan pemantauan dan tindak lanjut
          </p>
        </div>
        {showSampleLists && (
          <span className="rounded-full bg-secondary-soft px-2.5 py-1 text-[11px] font-semibold text-secondary">
            Sebagian data sample
          </span>
        )}
      </div>

      <div
        className={`grid grid-cols-1 gap-4 ${showSampleLists ? "xl:grid-cols-2" : ""}`}
      >
        <TrainingPriorityList
          entity="branch"
          initialData={trainingPriorities}
        />
        {showSampleLists && (
          <>
            <SuspendedEntityList />
            <LowChapterList />
            <LowestKaderList />
          </>
        )}
      </div>
    </section>
  );
}
