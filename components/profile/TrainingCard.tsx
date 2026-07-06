import { Award } from "lucide-react";
import type { TrainingResultEnum } from "@/lib/types";
import { PLACEHOLDER_TRAINING } from "./mockData";

const RESULT_LABELS: Record<TrainingResultEnum, string> = {
  passed: "Lulus",
  conditional_pass: "Lulus Bersyarat",
  failed: "Tidak Lulus",
};

export default function TrainingCard() {
  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-[#172033]">
        Riwayat Kaderisasi
      </h2>

      <div className="mt-3 flex flex-col gap-4">
        {PLACEHOLDER_TRAINING.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary">
              <Award className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#172033]">
                Latihan Kader {entry.level.replace("LK", "")} (
                {entry.level})
              </p>
              <p className="text-sm text-[#5f6573]">
                {entry.organizerName} • {RESULT_LABELS[entry.result]}
              </p>
              <p className="text-xs text-[#5f6573]">{entry.year}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
