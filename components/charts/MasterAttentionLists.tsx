import { Building2 } from "lucide-react";
import type { SuspendedEntities, TrainingPriorities } from "@/apis/stat";
import SuspendedEntityList from "./SuspendedEntityList";
import TrainingPriorityList from "./TrainingPriorityList";

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

function EntityIcon() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
      <Building2 className="size-3.5" />
    </span>
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
  suspendedBranches: SuspendedEntities | null;
  suspendedCoordinatingBodies: SuspendedEntities | null;
  showSampleLists?: boolean;
}

export default function MasterAttentionLists({
  trainingPriorities,
  suspendedBranches,
  suspendedCoordinatingBodies,
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TrainingPriorityList
          entity="branch"
          initialData={trainingPriorities}
        />
        <SuspendedEntityList
          tabs={[
            {
              entityType: "branch",
              label: "Cabang",
              initialData: suspendedBranches,
            },
            {
              entityType: "coordinating_body",
              label: "Badko",
              initialData: suspendedCoordinatingBodies,
            },
          ]}
        />
        {showSampleLists && (
          <>
            <LowChapterList />
            <LowestKaderList />
          </>
        )}
      </div>
    </section>
  );
}
