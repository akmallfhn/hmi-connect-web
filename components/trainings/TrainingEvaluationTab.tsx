"use client";

import { Loader2, Lock, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  TrainingEvaluationEntry,
  TrainingEvaluationMatrix,
} from "@/apis/trainings";
import {
  lockTrainingEvaluations,
  updateTrainingEvaluation,
} from "@/lib/actions";
import { isSuccessStatus, type TrainingResultEnum } from "@/lib/types";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import Label from "../common/Label";
import Pagination from "../common/Pagination";
import Input from "../fields/Input";
import AlertConfirmation from "../modals/AlertConfirmation";
import EmptyState from "../states/EmptyState";
import { TrainingResultLabel } from "./TrainingLabels";

interface TrainingEvaluationTabProps {
  trainingId: string;
  matrix: TrainingEvaluationMatrix;
  initialSearch: string;
  pageSize: number;
  canManage: boolean;
  isLocked: boolean;
}

const AFFECTIVE_ASPECTS = [
  { key: "aff_discipline", label: "Kedisiplinan dan Keteraturan" },
  { key: "aff_ethics", label: "Etika dan Sopan Santun" },
  { key: "aff_motivation", label: "Motivasi Belajar" },
  { key: "aff_teamwork", label: "Kerja Sama Tim" },
] as const;

const PSYCHOMOTOR_ASPECTS = [
  { key: "psym_public_speaking", label: "Kemampuan Berbicara di Depan Umum" },
  { key: "psym_discussion_leadership", label: "Kepemimpinan dalam Diskusi" },
  { key: "psym_report_writing", label: "Kemampuan Menulis Laporan" },
  { key: "psym_role_simulation", label: "Simulasi Peran dan Praktik" },
] as const;

type AffectiveKey = (typeof AFFECTIVE_ASPECTS)[number]["key"];
type PsychomotorKey = (typeof PSYCHOMOTOR_ASPECTS)[number]["key"];

// Column-group tint (header + body), one color per category — explained in the legend below the table.
const KOGNITIF_HEADER_BG = "bg-[#E8F5E9] text-[#2E7D32]";
const KOGNITIF_BODY_BG = "bg-[#E8F5E9]/50";
const AFEKTIF_HEADER_BG = "bg-[#EFEDF9] text-[#42359B]";
const AFEKTIF_BODY_BG = "bg-[#EFEDF9]/50";
const PSIKOMOTORIK_HEADER_BG = "bg-[#FDE7EE] text-[#BE2B5D]";
const PSIKOMOTORIK_BODY_BG = "bg-[#FDE7EE]/50";

const RESULT_LEGEND = [
  { label: "Lulus", range: "Nilai Akhir ≥ 65", dot: "bg-primary" },
  {
    label: "Lulus Bersyarat",
    range: "Nilai Akhir 50 – 64",
    dot: "bg-[#FACC15]",
  },
  { label: "Tidak Lulus", range: "Nilai Akhir < 50", dot: "bg-destructive" },
] as const;

const CATEGORY_LEGEND = [
  { label: "Penilaian Materi (Kognitif)", dot: "bg-[#2E7D32]" },
  { label: "Penilaian Afektif", dot: "bg-[#42359B]" },
  { label: "Penilaian Psikomotorik", dot: "bg-[#BE2B5D]" },
] as const;

// Same ≥65/50-64/<50 thresholds as lib/trainings/guideline-content.ts#LK2_ASSESSMENT.criteria.
function evaluationResult(
  finalScore: number,
  isComplete: boolean
): TrainingResultEnum | undefined {
  if (!isComplete) return undefined;
  if (finalScore >= 65) return "passed";
  if (finalScore >= 50) return "conditional_pass";
  return "failed";
}

interface ScoreCellProps {
  value?: number;
  disabled: boolean;
  onCommit: (score: number) => Promise<void>;
}

function ScoreCell({ value, disabled, onCommit }: ScoreCellProps) {
  const [draft, setDraft] = useState(value !== undefined ? String(value) : "");
  const [seenValue, setSeenValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  if (seenValue !== value) {
    setSeenValue(value);
    setDraft(value !== undefined ? String(value) : "");
  }

  async function commit() {
    const trimmed = draft.trim();
    const previous = value !== undefined ? String(value) : "";
    if (trimmed === previous) return;

    if (!trimmed) {
      setDraft(previous);
      return;
    }

    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric) || numeric < 1 || numeric > 100) {
      toast.error("Nilai harus di antara 1 dan 100.");
      setDraft(previous);
      return;
    }

    setIsSaving(true);
    try {
      await onCommit(numeric);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="relative mx-auto w-16">
      <input
        type="text"
        inputMode="numeric"
        value={draft}
        disabled={disabled || isSaving}
        placeholder="-"
        onChange={(event) =>
          setDraft(event.target.value.replace(/\D/g, "").slice(0, 3))
        }
        onBlur={commit}
        className="w-full rounded-md border border-[#dbe3ef] bg-white px-2 py-1.5 text-center text-sm text-[#172033] outline-none transition placeholder:text-[#c1c6cf] focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-[#8a909d]"
      />
      {isSaving && (
        <Loader2 className="absolute right-1.5 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-primary" />
      )}
    </div>
  );
}

export default function TrainingEvaluationTab({
  trainingId,
  matrix,
  initialSearch,
  pageSize,
  canManage,
  isLocked,
}: TrainingEvaluationTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seenSearch, setSeenSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  if (seenSearch !== initialSearch) {
    setSeenSearch(initialSearch);
    setSearchInput(initialSearch);
  }

  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  const [seenMatrix, setSeenMatrix] = useState(matrix);
  const [list, setList] = useState(matrix.list);
  if (seenMatrix !== matrix) {
    setSeenMatrix(matrix);
    setList(matrix.list);
  }

  function pushSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "penilaian");
    if (value) params.set("evaluation_search", value);
    else params.delete("evaluation_search");
    params.set("evaluation_page", "1");
    router.push(`?${params.toString()}`);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput === initialSearch) return;
      pushSearch(searchInput);
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  async function commitScore(
    entry: TrainingEvaluationEntry,
    field:
      | { type: "material"; materialId: string }
      | { type: "affective"; key: AffectiveKey }
      | { type: "psychomotor"; key: PsychomotorKey },
    score: number
  ) {
    const payload =
      field.type === "material"
        ? {
            material_scores: [
              { training_material_id: field.materialId, score },
            ],
          }
        : { [field.key]: score };

    const result = await updateTrainingEvaluation({
      training_id: trainingId,
      user_id: entry.user_id,
      ...payload,
    });

    if (!isSuccessStatus(result.status) || !result.data) {
      toast.error(result.message ?? "Gagal menyimpan nilai.");
      return;
    }

    const updated = result.data;
    setList((prev) =>
      prev.map((item) => (item.user_id === entry.user_id ? updated : item))
    );
  }

  async function handleLock() {
    setIsLocking(true);
    try {
      const result = await lockTrainingEvaluations(trainingId);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal mengunci penilaian.");
        return;
      }
      toast.success("Penilaian berhasil dikunci.");
      setShowLockConfirm(false);
      router.refresh();
    } finally {
      setIsLocking(false);
    }
  }

  const { materials, totalData, totalPage, currentPage } = matrix;

  return (
    <div className="rounded-xl border border-[#e6e9ef] bg-white">
      <div className="flex flex-col gap-3 border-b border-[#e6e9ef] p-5 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-sm">
          <Input
            inputId="training-evaluation-search"
            placeholder="Cari nama, username, atau email..."
            icon={<Search className="size-4" />}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        {canManage &&
          (isLocked ? (
            <Label
              variant="gray"
              icon={<Lock className="size-3.5" />}
              className="sm:ml-auto"
            >
              Penilaian Terkunci
            </Label>
          ) : (
            <Button
              variant="secondary"
              className="w-fit sm:ml-auto"
              onClick={() => setShowLockConfirm(true)}
            >
              <Lock className="size-4" />
              Tetapkan Penilaian
            </Button>
          ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={
            initialSearch ? "Peserta Tidak Ditemukan" : "Belum Ada Penilaian"
          }
          description={
            initialSearch
              ? "Coba ubah kata kunci pencarian."
              : "Data penilaian untuk training ini belum tersedia."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-b-xl">
          <table className="w-full min-w-[1320px] text-left text-sm">
            <thead className="border-b border-[#e6e9ef] text-[13px] font-semibold text-[#5f6573]">
              <tr>
                <th className="sticky left-0 z-20 w-[220px] min-w-[220px] border-r border-[#e6e9ef] bg-[#f5f7fb] px-4 py-2 align-bottom">
                  Peserta
                </th>
                {materials.map((material, i) => (
                  <th
                    key={material.training_material_id}
                    className={`px-2 py-2 text-center font-medium ${KOGNITIF_HEADER_BG} ${i === 0 ? "border-l border-[#e6e9ef]" : ""}`}
                    title={material.title}
                  >
                    <span className="mx-auto line-clamp-2 max-w-[110px] text-center">
                      {material.title}
                    </span>
                  </th>
                ))}
                {AFFECTIVE_ASPECTS.map((aspect, i) => (
                  <th
                    key={aspect.key}
                    className={`px-2 py-2 text-center font-medium ${AFEKTIF_HEADER_BG} ${i === 0 ? "border-l border-[#e6e9ef]" : ""}`}
                  >
                    <span className="mx-auto line-clamp-2 max-w-[110px] text-center">
                      {aspect.label}
                    </span>
                  </th>
                ))}
                {PSYCHOMOTOR_ASPECTS.map((aspect, i) => (
                  <th
                    key={aspect.key}
                    className={`px-2 py-2 text-center font-medium ${PSIKOMOTORIK_HEADER_BG} ${i === 0 ? "border-l border-[#e6e9ef]" : ""}`}
                  >
                    <span className="mx-auto line-clamp-2 max-w-[110px] text-center">
                      {aspect.label}
                    </span>
                  </th>
                ))}
                <th className="border-l border-[#e6e9ef] bg-[#f5f7fb] px-4 py-2 align-bottom">
                  Nilai Akhir
                </th>
                <th className="bg-[#f5f7fb] px-4 py-2 align-bottom">Hasil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e9ef] text-[13px]">
              {list.map((entry) => {
                const materialScoreByMaterialId = new Map(
                  entry.material_scores.map((score) => [
                    score.training_material_id,
                    score.score,
                  ])
                );

                return (
                  <tr key={entry.user_id}>
                    <td className="sticky left-0 z-10 w-[220px] min-w-[220px] border-r border-[#e6e9ef] bg-white px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={entry.user_avatar}
                          name={entry.user_full_name}
                          size={32}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#172033]">
                            {entry.user_full_name}
                          </p>
                          <p className="truncate text-xs text-[#5f6573]">
                            @{entry.user_username}
                          </p>
                        </div>
                      </div>
                    </td>
                    {materials.map((material, i) => (
                      <td
                        key={material.training_material_id}
                        className={`px-2 py-2 ${KOGNITIF_BODY_BG} ${i === 0 ? "border-l border-[#e6e9ef]" : ""}`}
                      >
                        <ScoreCell
                          value={materialScoreByMaterialId.get(
                            material.training_material_id
                          )}
                          disabled={!canManage || isLocked}
                          onCommit={(score) =>
                            commitScore(
                              entry,
                              {
                                type: "material",
                                materialId: material.training_material_id,
                              },
                              score
                            )
                          }
                        />
                      </td>
                    ))}
                    {AFFECTIVE_ASPECTS.map((aspect, i) => (
                      <td
                        key={aspect.key}
                        className={`px-2 py-2 ${AFEKTIF_BODY_BG} ${i === 0 ? "border-l border-[#e6e9ef]" : ""}`}
                      >
                        <ScoreCell
                          value={entry[aspect.key]}
                          disabled={!canManage || isLocked}
                          onCommit={(score) =>
                            commitScore(
                              entry,
                              { type: "affective", key: aspect.key },
                              score
                            )
                          }
                        />
                      </td>
                    ))}
                    {PSYCHOMOTOR_ASPECTS.map((aspect, i) => (
                      <td
                        key={aspect.key}
                        className={`px-2 py-2 ${PSIKOMOTORIK_BODY_BG} ${i === 0 ? "border-l border-[#e6e9ef]" : ""}`}
                      >
                        <ScoreCell
                          value={entry[aspect.key]}
                          disabled={!canManage || isLocked}
                          onCommit={(score) =>
                            commitScore(
                              entry,
                              { type: "psychomotor", key: aspect.key },
                              score
                            )
                          }
                        />
                      </td>
                    ))}
                    <td className="border-l border-[#e6e9ef] px-4 py-3 text-center text-base font-bold text-primary">
                      {entry.final_score}
                    </td>
                    <td className="px-4 py-3">
                      <TrainingResultLabel
                        result={evaluationResult(
                          entry.final_score,
                          entry.is_complete
                        )}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {list.length > 0 && (
        <div className="grid gap-4 border-t border-[#e6e9ef] p-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold text-[#5f6573]">
              Keterangan Hasil
            </p>
            <div className="flex flex-col gap-2">
              {RESULT_LEGEND.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-1.5 text-xs text-[#41474E]"
                >
                  <span
                    className={`size-2.5 shrink-0 rounded-full ${item.dot}`}
                  />
                  <span className="font-medium">{item.label}</span>
                  <span className="text-[#8a909d]">({item.range})</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-[#5f6573]">
              Keterangan Kategori Penilaian
            </p>
            <div className="flex flex-col gap-2">
              {CATEGORY_LEGEND.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-1.5 text-xs text-[#41474E]"
                >
                  <span
                    className={`size-2.5 shrink-0 rounded-full ${item.dot}`}
                  />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {list.length > 0 && (
        <div className="flex flex-col items-center gap-3 border-t border-[#e6e9ef] p-5">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPage}
            queryKey="evaluation_page"
          />
          <p className="text-center text-sm text-[#5f6573]">
            Menampilkan {(currentPage - 1) * pageSize + 1}-
            {(currentPage - 1) * pageSize + list.length} dari {totalData}{" "}
            peserta
          </p>
        </div>
      )}

      <AlertConfirmation
        open={showLockConfirm}
        onClose={() => setShowLockConfirm(false)}
        onConfirm={handleLock}
        title="Tetapkan penilaian training ini?"
        message="Setelah ditetapkan, materi, peserta terdaftar, dan nilai tidak dapat diubah lagi. Tindakan ini permanen dan tidak dapat dibatalkan."
        confirmLabel="Tetapkan Penilaian"
        confirmVariant="destructive"
        loading={isLocking}
      />
    </div>
  );
}
