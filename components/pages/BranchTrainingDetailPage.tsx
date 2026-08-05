"use client";

import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  LayoutDashboard,
  Pencil,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type {
  PagedTrainingResult,
  TrainingDetail,
  TrainingEvaluationMatrix,
  TrainingMaterial,
  TrainingParticipant,
} from "@/apis/trainings";
import Button from "../buttons/Button";
import TrainingFormSheet from "../forms/TrainingFormSheet";
import EmptyState from "../states/EmptyState";
import TrainingEvaluationTab from "../trainings/TrainingEvaluationTab";
import TrainingMaterialsTab from "../trainings/TrainingMaterialsTab";
import TrainingParticipantsTab from "../trainings/TrainingParticipantsTab";
import TrainingSummaryTab from "../trainings/TrainingSummaryTab";

export type TrainingDetailTab =
  | "ringkasan"
  | "materi"
  | "peserta"
  | "penilaian";

interface BranchTrainingDetailPageProps {
  branchId: string;
  training: TrainingDetail;
  materials: PagedTrainingResult<TrainingMaterial>;
  participants: PagedTrainingResult<TrainingParticipant>;
  evaluationMatrix: TrainingEvaluationMatrix | null;
  initialTab: TrainingDetailTab;
  initialMaterialSearch: string;
  initialParticipantSearch: string;
  initialEvaluationSearch: string;
  pageSize: number;
  canManageTrainings: boolean;
  canManageEvaluations: boolean;
}

const TABS: { id: TrainingDetailTab; label: string; icon: LucideIcon }[] = [
  { id: "ringkasan", label: "Ringkasan", icon: LayoutDashboard },
  { id: "materi", label: "Materi", icon: BookOpen },
  { id: "peserta", label: "Peserta", icon: Users },
  { id: "penilaian", label: "Penilaian", icon: ClipboardCheck },
];

export default function BranchTrainingDetailPage({
  branchId,
  training,
  materials,
  participants,
  evaluationMatrix,
  initialTab,
  initialMaterialSearch,
  initialParticipantSearch,
  initialEvaluationSearch,
  pageSize,
  canManageTrainings,
  canManageEvaluations,
}: BranchTrainingDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seenTab, setSeenTab] = useState(initialTab);
  const [activeTab, setActiveTab] = useState<TrainingDetailTab>(initialTab);
  if (seenTab !== initialTab) {
    setSeenTab(initialTab);
    setActiveTab(initialTab);
  }
  const [showEditSheet, setShowEditSheet] = useState(false);

  function selectTab(tab: TrainingDetailTab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "ringkasan") params.delete("tab");
    else params.set("tab", tab);
    router.replace(`?${params.toString()}`, { scroll: false });
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
        <h1 className="min-w-0 text-2xl font-bold text-[#172033] sm:text-3xl">
          {training.name}
        </h1>
        {canManageTrainings && (
          <Button onClick={() => setShowEditSheet(true)} className="shrink-0">
            <Pencil className="size-4" />
            Edit Detail
          </Button>
        )}
      </div>

      <div className="mt-6">
        <div
          role="tablist"
          aria-label="Detail training"
          className="grid w-full grid-cols-4 gap-1 rounded-lg border border-[#e6e9ef] bg-white p-1 sm:max-w-2xl"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => selectTab(tab.id)}
                className={`flex h-14 min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-md px-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30 sm:h-10 sm:flex-row sm:gap-2 sm:px-4 sm:text-sm ${
                  isActive
                    ? "bg-secondary text-white shadow-sm"
                    : "text-[#69707d] hover:bg-secondary-soft hover:text-secondary"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
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
        {activeTab === "penilaian" &&
          (evaluationMatrix ? (
            <TrainingEvaluationTab
              trainingId={training.id}
              matrix={evaluationMatrix}
              initialSearch={initialEvaluationSearch}
              pageSize={pageSize}
              canManage={canManageEvaluations}
            />
          ) : (
            <EmptyState
              title="Belum ada penilaian"
              description="Data penilaian untuk training ini belum tersedia."
            />
          ))}
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
    </div>
  );
}
