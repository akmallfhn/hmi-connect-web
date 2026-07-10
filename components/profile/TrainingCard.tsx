"use client";

import { Award, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TrainingResultEnum } from "@/lib/types";
import type { TrainingHistoryEntry } from "@/apis/users";
import Button from "../buttons/Button";
import EditTrainingForm from "../forms/EditTrainingForm";

const RESULT_LABELS: Record<TrainingResultEnum, string> = {
  passed: "Lulus",
  conditional_pass: "Lulus Bersyarat",
  failed: "Tidak Lulus",
};

interface TrainingCardProps {
  userId?: string;
  entries: TrainingHistoryEntry[];
  isOwnProfile?: boolean;
}

export default function TrainingCard({
  userId,
  entries,
  isOwnProfile,
}: TrainingCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (entries.length === 0 && !isOwnProfile) return null;

  return (
    <div className="border border-x-0 border-[#e6e9ef] bg-white p-5 shadow-sm lg:rounded-2xl lg:border-x">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#172033]">
          Riwayat Kaderisasi
        </h2>
        {isOwnProfile && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(true)}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
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

      {isOwnProfile && (
        <EditTrainingForm
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSaved={() => {
            setIsEditOpen(false);
            router.refresh();
          }}
          userId={userId}
          entries={entries}
        />
      )}
    </div>
  );
}
