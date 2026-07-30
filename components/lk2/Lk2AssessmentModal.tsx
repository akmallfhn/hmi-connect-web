"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import NumberInput from "../fields/NumberInput";
import Modal from "../modals/Modal";
import { Lk2ParticipantStatusLabel } from "./Lk2Labels";
import type { Lk2Batch, Lk2Participant, Lk2ParticipantStatus } from "./mockData";

interface Lk2AssessmentModalProps {
  open: boolean;
  onClose: () => void;
  batch: Lk2Batch;
  participant: Lk2Participant | null;
}

interface AssessmentAspect {
  key: string;
  label: string;
  weight: number;
}

// Non-material aspects of the rubric — weights sum to 100 - MATERIALS_POOL_WEIGHT below.
const ASSESSMENT_ASPECTS: AssessmentAspect[] = [
  { key: "kedisiplinan", label: "Kedisiplinan", weight: 15 },
  { key: "ketepatan_waktu", label: "Ketepatan Waktu", weight: 10 },
  { key: "partisipasi", label: "Partisipasi & Keaktifan", weight: 10 },
  { key: "etika", label: "Etika & Sopan Santun", weight: 5 },
];

const MATERIALS_POOL_WEIGHT = 60;

function clampScore(raw: string): number {
  const value = Number(raw);
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function statusFromScore(score: number): Lk2ParticipantStatus {
  if (score >= 80) return "passed";
  if (score >= 60) return "conditional_pass";
  return "failed";
}

// Prototype only — "Simpan Penilaian" toasts and closes, no real API to persist a per-material/per-aspect rubric yet.
export default function Lk2AssessmentModal({
  open,
  onClose,
  batch,
  participant,
}: Lk2AssessmentModalProps) {
  if (!participant) return null;

  return (
    <Modal open={open} onClose={onClose} title="Beri Penilaian" panelClassName="max-w-2xl">
      {open && <Lk2AssessmentForm batch={batch} participant={participant} onClose={onClose} />}
    </Modal>
  );
}

function Lk2AssessmentForm({
  batch,
  participant,
  onClose,
}: {
  batch: Lk2Batch;
  participant: Lk2Participant;
  onClose: () => void;
}) {
  const materialWeight =
    batch.materials.length > 0 ? MATERIALS_POOL_WEIGHT / batch.materials.length : 0;

  const [materialScores, setMaterialScores] = useState<Record<string, string>>(
    Object.fromEntries(batch.materials.map((material) => [material.title, ""]))
  );
  const [aspectScores, setAspectScores] = useState<Record<string, string>>(
    Object.fromEntries(ASSESSMENT_ASPECTS.map((aspect) => [aspect.key, ""]))
  );

  const finalScore = useMemo(() => {
    let weighted = 0;
    for (const material of batch.materials) {
      weighted += (clampScore(materialScores[material.title] ?? "") * materialWeight) / 100;
    }
    for (const aspect of ASSESSMENT_ASPECTS) {
      weighted += (clampScore(aspectScores[aspect.key] ?? "") * aspect.weight) / 100;
    }
    return weighted;
  }, [batch.materials, materialScores, aspectScores, materialWeight]);

  function handleSave() {
    toast.success(`Penilaian untuk ${participant.fullName} berhasil disimpan (prototipe).`);
    onClose();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl bg-[#f5f7fb] p-3">
        <p className="truncate text-sm font-semibold text-[#172033]">{participant.fullName}</p>
        <p className="truncate text-xs text-[#5f6573]">
          @{participant.username} · {batch.name}
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold text-[#172033]">Nilai per Materi</p>
        <p className="text-xs text-[#5f6573]">
          Total bobot materi {MATERIALS_POOL_WEIGHT}%, dibagi rata ke {batch.materials.length} materi.
        </p>
        <div className="mt-2 flex flex-col divide-y divide-[#e6e9ef]">
          {batch.materials.map((material) => (
            <div key={material.title} className="flex items-center gap-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-[#172033]">{material.title}</p>
                <p className="text-xs text-[#5f6573]">Bobot {materialWeight.toFixed(1)}%</p>
              </div>
              <div className="w-24 shrink-0">
                <NumberInput
                  inputId={`lk2-assessment-material-${material.title}`}
                  mode="numeric"
                  placeholder="0-100"
                  value={materialScores[material.title] ?? ""}
                  onValueChange={(value) =>
                    setMaterialScores((prev) => ({ ...prev, [material.title]: value }))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-[#172033]">Aspek Lainnya</p>
        <p className="text-xs text-[#5f6573]">
          Total bobot aspek {100 - MATERIALS_POOL_WEIGHT}%.
        </p>
        <div className="mt-2 flex flex-col divide-y divide-[#e6e9ef]">
          {ASSESSMENT_ASPECTS.map((aspect) => (
            <div key={aspect.key} className="flex items-center gap-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-[#172033]">{aspect.label}</p>
                <p className="text-xs text-[#5f6573]">Bobot {aspect.weight}%</p>
              </div>
              <div className="w-24 shrink-0">
                <NumberInput
                  inputId={`lk2-assessment-aspect-${aspect.key}`}
                  mode="numeric"
                  placeholder="0-100"
                  value={aspectScores[aspect.key] ?? ""}
                  onValueChange={(value) =>
                    setAspectScores((prev) => ({ ...prev, [aspect.key]: value }))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-[#e6e9ef] bg-primary-soft/40 p-4">
        <div>
          <p className="text-sm text-[#5f6573]">Nilai Akhir</p>
          <p className="text-2xl font-bold text-[#172033]">{finalScore.toFixed(1)}</p>
        </div>
        <Lk2ParticipantStatusLabel status={statusFromScore(finalScore)} />
      </div>

      <div className="flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
        <Button variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Simpan Penilaian
        </Button>
      </div>
    </div>
  );
}
