"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Button from "../buttons/Button";
import Label from "../common/Label";
import GenerateCertificateModal from "../lk2/GenerateCertificateModal";
import GenerateSkModal from "../lk2/GenerateSkModal";
import Lk2AssessmentModal from "../lk2/Lk2AssessmentModal";
import Lk2BatchSidePanel from "../lk2/Lk2BatchSidePanel";
import Lk2MaterialsTab from "../lk2/Lk2MaterialsTab";
import Lk2ParticipantsTab from "../lk2/Lk2ParticipantsTab";
import Lk2SummaryTab from "../lk2/Lk2SummaryTab";
import type { Lk2Batch, Lk2Participant } from "../lk2/mockData";

interface BranchLk2DetailPageProps {
  branchId: string;
  batch: Lk2Batch;
}

type Lk2DetailTab = "ringkasan" | "peserta" | "materi";

const TABS: { id: Lk2DetailTab; label: string }[] = [
  { id: "ringkasan", label: "Ringkasan" },
  { id: "materi", label: "Materi" },
  { id: "peserta", label: "Daftar Peserta" },
];

// Frontend-only prototype — batch comes from LK2_BATCHES mock data, no real API behind this yet.
export default function BranchLk2DetailPage({ branchId, batch }: BranchLk2DetailPageProps) {
  const [activeTab, setActiveTab] = useState<Lk2DetailTab>("ringkasan");
  const [certificateTarget, setCertificateTarget] = useState<Lk2Participant | null>(null);
  const [assessmentTarget, setAssessmentTarget] = useState<Lk2Participant | null>(null);
  const [showSkModal, setShowSkModal] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href={`/branches/${branchId}/lk2`} className="inline-block w-fit">
        <Button variant="ghost">
          <ArrowLeft className="size-4" />
          Kembali ke daftar batch
        </Button>
      </Link>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">Latihan Kader 2</h1>
          <Label variant="green">Aktif</Label>
        </div>
        <p className="mt-1.5 text-sm text-[#5f6573] sm:text-base">
          Kelola peserta, materi, dan progress pelatihan dengan mudah.
        </p>
      </div>

      <div className="mt-6 flex gap-6 overflow-x-auto border-b border-[#e6e9ef]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
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

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          {activeTab === "ringkasan" && <Lk2SummaryTab batch={batch} />}
          {activeTab === "materi" && <Lk2MaterialsTab batch={batch} />}
          {activeTab === "peserta" && (
            <Lk2ParticipantsTab
              batch={batch}
              onAssess={setAssessmentTarget}
              onViewCertificate={setCertificateTarget}
            />
          )}
        </div>

        {activeTab === "ringkasan" && (
          <Lk2BatchSidePanel batch={batch} onGenerateSk={() => setShowSkModal(true)} />
        )}
      </div>

      <GenerateCertificateModal
        open={certificateTarget !== null}
        onClose={() => setCertificateTarget(null)}
        batch={batch}
        participant={certificateTarget}
      />
      <Lk2AssessmentModal
        open={assessmentTarget !== null}
        onClose={() => setAssessmentTarget(null)}
        batch={batch}
        participant={assessmentTarget}
      />
      <GenerateSkModal open={showSkModal} onClose={() => setShowSkModal(false)} batch={batch} />
    </div>
  );
}
