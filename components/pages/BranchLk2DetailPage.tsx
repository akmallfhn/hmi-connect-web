"use client";

import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type {
  PagedTrainingResult,
  TrainingDetail,
  TrainingMaterial,
  TrainingParticipant,
} from "@/apis/trainings";
import { deleteTraining } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import TrainingFormSheet from "../forms/TrainingFormSheet";
import AlertConfirmation from "../modals/AlertConfirmation";
import { TrainingStatusLabel } from "../training/TrainingLabels";
import TrainingMaterialsTab from "../training/TrainingMaterialsTab";
import TrainingParticipantsTab from "../training/TrainingParticipantsTab";
import TrainingSummaryTab from "../training/TrainingSummaryTab";

export type TrainingDetailTab = "ringkasan" | "materi" | "peserta";

interface BranchLk2DetailPageProps {
  branchId: string;
  training: TrainingDetail;
  materials: PagedTrainingResult<TrainingMaterial>;
  participants: PagedTrainingResult<TrainingParticipant>;
  initialTab: TrainingDetailTab;
  initialMaterialSearch: string;
  initialParticipantSearch: string;
  pageSize: number;
  canManageTrainings: boolean;
}

const TABS: { id: TrainingDetailTab; label: string }[] = [
  { id: "ringkasan", label: "Ringkasan" },
  { id: "materi", label: "Materi" },
  { id: "peserta", label: "Daftar Peserta" },
];

export default function BranchLk2DetailPage({
  branchId,
  training,
  materials,
  participants,
  initialTab,
  initialMaterialSearch,
  initialParticipantSearch,
  pageSize,
  canManageTrainings,
}: BranchLk2DetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seenTab, setSeenTab] = useState(initialTab);
  const [activeTab, setActiveTab] = useState<TrainingDetailTab>(initialTab);
  if (seenTab !== initialTab) {
    setSeenTab(initialTab);
    setActiveTab(initialTab);
  }
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function selectTab(tab: TrainingDetailTab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "ringkasan") params.delete("tab");
    else params.set("tab", tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteTraining(training.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menghapus batch LK2.");
        return;
      }
      toast.success("Batch LK2 berhasil dihapus.");
      router.push(`/branches/${branchId}/trainings`);
      router.refresh();
    } catch (error) {
      console.error("[BranchLk2DetailPage] delete threw:", error);
      toast.error("Gagal menghapus batch LK2.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        href={`/branches/${branchId}/trainings`}
        className="inline-block w-fit"
      >
        <Button variant="ghost">
          <ArrowLeft className="size-4" />
          Kembali ke daftar batch
        </Button>
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">
              {training.name}
            </h1>
            <TrainingStatusLabel
              startDate={training.start_date}
              endDate={training.end_date}
            />
          </div>
          <p className="mt-1.5 text-sm text-[#5f6573] sm:text-base">
            Latihan Kader 2 oleh {training.organizer_name ?? "Cabang"}.
          </p>
        </div>
        {canManageTrainings && (
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={() => setShowEditSheet(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="size-4" />
              Hapus
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-6 overflow-x-auto border-b border-[#e6e9ef]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => selectTab(tab.id)}
            className={`shrink-0 cursor-pointer border-b-2 pb-3 text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-[#5f6573] hover:text-[#172033]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "ringkasan" && (
          <TrainingSummaryTab
            training={training}
            materialCount={materials.totalData}
            participantCount={participants.totalData}
          />
        )}
        {activeTab === "materi" && (
          <TrainingMaterialsTab
            trainingId={training.id}
            materials={materials.list}
            totalData={materials.totalData}
            totalPage={materials.totalPage}
            currentPage={materials.currentPage}
            initialSearch={initialMaterialSearch}
            pageSize={pageSize}
            canManage={canManageTrainings}
          />
        )}
        {activeTab === "peserta" && (
          <TrainingParticipantsTab
            participants={participants.list}
            totalData={participants.totalData}
            totalPage={participants.totalPage}
            currentPage={participants.currentPage}
            initialSearch={initialParticipantSearch}
            pageSize={pageSize}
          />
        )}
      </div>

      <TrainingFormSheet
        open={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        onSaved={() => {
          setShowEditSheet(false);
          router.refresh();
        }}
        branchId={branchId}
        training={training}
      />
      <AlertConfirmation
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Hapus batch LK2 ini?"
        message={`${training.name} beserta materi terkait akan dihapus permanen.`}
        confirmLabel="Hapus"
        loading={isDeleting}
      />
    </div>
  );
}
