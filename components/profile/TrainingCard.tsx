"use client";

import { IconCertificate } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TrainingResultEnum } from "@/lib/types";
import { TRAINING_HISTORY_LEVEL_LABELS } from "@/lib/training-history";
import type { TrainingHistoryEntry } from "@/apis/users";
import EditTrainingForm from "../forms/EditTrainingForm";
import { AddEntryButton, EditEntryButton } from "./ProfileEntryButtons";

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
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TrainingHistoryEntry | null>(null);

  function openForm(entry: TrainingHistoryEntry | null) {
    setEditTarget(entry);
    setFormOpen(true);
  }

  if (entries.length === 0 && !isOwnProfile) return null;

  return (
    <div className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-stack-sans-headline font-medium text-heading xl:text-[15px]">
          Riwayat Kaderisasi
        </h2>
        {isOwnProfile && (
          <AddEntryButton onClick={() => openForm(null)} />
        )}
      </div>

      <div className="mt-3 flex flex-col gap-4">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-secondary-foreground">
              <IconCertificate className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-heading xl:text-[15px]">
                {TRAINING_HISTORY_LEVEL_LABELS[entry.level]}
              </p>
              <p className="text-sm text-muted-foreground xl:text-[15px]">
                {entry.organizer_name} • {RESULT_LABELS[entry.result]}
              </p>
              <p className="text-xs text-muted-foreground xl:text-[13px]">
                {entry.year}
              </p>
            </div>
            {isOwnProfile && (
              <EditEntryButton
                onClick={() => openForm(entry)}
                label="Edit riwayat kaderisasi"
              />
            )}
          </div>
        ))}
      </div>

      {isOwnProfile && (
        <EditTrainingForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            router.refresh();
          }}
          entry={editTarget}
        />
      )}
    </div>
  );
}
