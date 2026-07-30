"use client";

import { Award, CheckCircle2, TrendingUp, UserRoundCheck, Users, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import StatusDonut from "../charts/StatusDonut";
import Lk2ScoreTrendChart from "./Lk2ScoreTrendChart";
import Lk2StatCard from "./Lk2StatCard";
import type { Lk2Activity, Lk2Batch } from "./mockData";

interface Lk2SummaryTabProps {
  batch: Lk2Batch;
}

const KELULUSAN_TARGET_PERCENT = 70;

const ACTIVITY_ICON: Record<string, { icon: LucideIcon; color: string }> = {
  "Menambahkan materi baru": { icon: CheckCircle2, color: "text-primary" },
  "Mengubah nilai peserta": { icon: TrendingUp, color: "text-[#164EA6]" },
  "Mengubah status peserta": { icon: UserRoundCheck, color: "text-[#8A6300]" },
  "Generate SK Kelulusan": { icon: Award, color: "text-[#42359B]" },
};

function ActivityRow({ activity }: { activity: Lk2Activity }) {
  const meta = ACTIVITY_ICON[activity.action] ?? { icon: CheckCircle2, color: "text-[#5f6573]" };
  const Icon = meta.icon;
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f5f7fb]">
        <Icon className={`size-4 ${meta.color}`} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#172033]">{activity.actor}</p>
        <p className="truncate text-sm text-[#5f6573]">
          {activity.action} · {activity.target}
        </p>
      </div>
      <p className="shrink-0 text-xs text-[#5f6573]">{activity.timestamp}</p>
    </div>
  );
}

// Prototype only — all figures derived from mock batch.participants/materials/activities, no real API.
export default function Lk2SummaryTab({ batch }: Lk2SummaryTabProps) {
  const passedCount = batch.participants.filter((p) => p.status === "passed").length;
  const conditionalCount = batch.participants.filter((p) => p.status === "conditional_pass").length;
  const failedCount = batch.participants.filter((p) => p.status === "failed").length;
  const total = batch.participants.length;
  const quotaPercent = batch.quota > 0 ? Math.round((total / batch.quota) * 100) : 0;

  const gradPercent = total > 0 ? Math.round(((passedCount + conditionalCount) / total) * 100) : 0;
  const targetReached = gradPercent >= KELULUSAN_TARGET_PERCENT;

  const scored = batch.participants.filter((p) => p.score !== null);
  const averageScore =
    scored.length > 0
      ? scored.reduce((sum, p) => sum + (p.score ?? 0), 0) / scored.length
      : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Lk2StatCard
          icon={Users}
          color="blue"
          label="Total Peserta"
          value={total}
          hint={`${quotaPercent}% dari kuota`}
        />
        <Lk2StatCard icon={Award} color="green" label="Lulus" value={passedCount} hint={`${total > 0 ? Math.round((passedCount / total) * 100) : 0}%`} />
        <Lk2StatCard
          icon={Award}
          color="yellow"
          label="Lulus Bersyarat"
          value={conditionalCount}
          hint={`${total > 0 ? Math.round((conditionalCount / total) * 100) : 0}%`}
        />
        <Lk2StatCard
          icon={XCircle}
          color="red"
          label="Tidak Lulus"
          value={failedCount}
          hint={`${total > 0 ? Math.round((failedCount / total) * 100) : 0}%`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StatusDonut
            title="Progress Kelulusan"
            subtitle="Distribusi status kelulusan peserta batch ini"
            centerLabel={batch.status === "completed" ? "Selesai" : "Berjalan"}
            segments={[
              { name: "Lulus", value: passedCount, color: "#0ca30c" },
              { name: "Lulus Bersyarat", value: conditionalCount, color: "#f5a524" },
              { name: "Tidak Lulus", value: failedCount, color: "#ef4444" },
            ]}
          />
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-[#e6e9ef] bg-white p-5">
          <p className="text-sm text-[#5f6573]">Target Kelulusan</p>
          <p className="mt-1 text-2xl font-bold text-[#172033]">≥ {KELULUSAN_TARGET_PERCENT}%</p>
          <p
            className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${
              targetReached ? "text-[#0ca30c]" : "text-[#5f6573]"
            }`}
          >
            {targetReached && <CheckCircle2 className="size-4" />}
            {targetReached ? "Target tercapai" : `Saat ini ${gradPercent}%`}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#e6e9ef] bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-[#172033]">Performa Materi</p>
        </div>
        <div className="mt-3 flex flex-col divide-y divide-[#e6e9ef]">
          {batch.materials.map((material) => (
            <div
              key={material.title}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="min-w-0 sm:w-56 sm:shrink-0">
                <p className="truncate text-sm font-medium text-[#172033]">{material.title}</p>
                <p className="truncate text-xs text-[#5f6573]">{material.hours} jam</p>
              </div>
              <div className="flex flex-1 items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f5f7fb]">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${material.understandingPercent}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-semibold text-[#172033]">
                  {material.understandingPercent}%
                </span>
              </div>
              <p className="shrink-0 text-xs text-[#5f6573] sm:w-32">{material.instructor}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatusDonut
          title="Distribusi Nilai"
          subtitle="Sebaran nilai akhir peserta"
          centerLabel="Nilai"
          segments={[
            { name: "Lulus (≥80)", value: passedCount, color: "#0ca30c" },
            { name: "Lulus Bersyarat (60-79)", value: conditionalCount, color: "#f5a524" },
            { name: "Tidak Lulus (<60)", value: failedCount, color: "#ef4444" },
          ]}
        />
        <Lk2ScoreTrendChart
          points={batch.scoreTrend}
          average={averageScore}
          deltaFromPreviousBatch={batch.scoreDeltaFromPreviousBatch}
        />
      </div>

      <div className="rounded-xl border border-[#e6e9ef] bg-white p-5">
        <p className="text-sm font-bold text-[#172033]">Aktivitas Terbaru</p>
        {batch.activities.length === 0 ? (
          <p className="mt-3 text-sm text-[#5f6573]">Belum ada aktivitas.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {batch.activities.map((activity, index) => (
              <ActivityRow key={`${activity.actor}-${index}`} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
