"use client";

import { Award, Pencil } from "lucide-react";
import type { TrainingResultEnum } from "@/lib/types";
import type { TrainingHistoryEntry } from "@/apis/users";
import { useProfileEdit } from "../modals/AppModals";

const RESULT_LABELS: Record<TrainingResultEnum, string> = {
  passed: "Lulus",
  conditional_pass: "Lulus Bersyarat",
  failed: "Tidak Lulus",
};

interface TrainingCardProps {
  entries: TrainingHistoryEntry[];
  isOwnProfile?: boolean;
}

export default function TrainingCard({
  entries,
  isOwnProfile,
}: TrainingCardProps) {
  const { openModal } = useProfileEdit();

  if (entries.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#172033]">
          Riwayat Kaderisasi
        </h2>
        {isOwnProfile && (
          <button
            type="button"
            onClick={() => openModal("training")}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-primary transition hover:bg-primary-soft"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-4">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary">
              <Award className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#172033]">
                Latihan Kader {entry.level.replace("LK", "")} ({entry.level})
              </p>
              <p className="text-sm text-[#5f6573]">
                {entry.organizer_name} • {RESULT_LABELS[entry.result]}
              </p>
              <p className="text-xs text-[#5f6573]">{entry.year}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
