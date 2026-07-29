"use client";

import {
  ArrowLeft,
  Award,
  BookOpen,
  CalendarDays,
  FileCheck2,
  MapPin,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode, useState } from "react";
import Button from "../buttons/Button";
import GenerateCertificateModal from "../lk2/GenerateCertificateModal";
import GenerateSkModal from "../lk2/GenerateSkModal";
import { Lk2BatchStatusLabel, Lk2ParticipantStatusLabel } from "../lk2/Lk2Labels";
import type { Lk2Batch, Lk2Participant } from "../lk2/mockData";

interface BranchLk2DetailPageProps {
  branchId: string;
  batch: Lk2Batch;
}

function formatDateRange(startDate: string, endDate: string) {
  const format = (value: string) =>
    new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  return `${format(startDate)} – ${format(endDate)}`;
}

function StatPill({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#e6e9ef] bg-white px-4 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13px] text-[#5f6573]">{label}</p>
        <p className="truncate text-[15px] font-bold text-[#172033]">{value}</p>
      </div>
    </div>
  );
}

// Frontend-only prototype — batch comes from LK2_BATCHES mock data, no real API behind this yet.
export default function BranchLk2DetailPage({ branchId, batch }: BranchLk2DetailPageProps) {
  const [certificateTarget, setCertificateTarget] = useState<Lk2Participant | null>(null);
  const [showSkModal, setShowSkModal] = useState(false);

  const passedCount = batch.participants.filter((p) => p.status === "passed").length;
  const conditionalCount = batch.participants.filter((p) => p.status === "conditional_pass").length;
  const failedCount = batch.participants.filter((p) => p.status === "failed").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href={`/branches/${branchId}/lk2`} className="inline-block w-fit">
        <Button variant="ghost">
          <ArrowLeft className="size-4" />
          Kembali ke daftar batch
        </Button>
      </Link>

      <div className="mt-4 flex flex-col gap-4 rounded-xl border border-[#e6e9ef] bg-white p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#172033]">{batch.name}</h1>
            <Lk2BatchStatusLabel status={batch.status} />
          </div>
          <div className="mt-2 flex flex-col gap-1 text-sm text-[#5f6573]">
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0" />
              {formatDateRange(batch.startDate, batch.endDate)}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" />
              {batch.location}
            </span>
            <span className="flex items-center gap-2">
              <Users className="size-4 shrink-0" />
              MOT: {batch.mot}
            </span>
          </div>
        </div>
        <Button variant="primary" onClick={() => setShowSkModal(true)} className="w-fit shrink-0">
          <FileCheck2 className="size-4" />
          Generate SK Kelulusan
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill icon={Users} label="Total Peserta" value={batch.participants.length} />
        <StatPill icon={Award} label="Lulus" value={passedCount} />
        <StatPill icon={Award} label="Lulus Bersyarat" value={conditionalCount} />
        <StatPill icon={Award} label="Tidak Lulus" value={failedCount} />
      </div>

      <div className="mt-4 rounded-xl border border-[#e6e9ef] bg-white p-5">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-primary" />
          <h2 className="text-base font-semibold text-[#172033]">Materi</h2>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-[#e6e9ef] text-[13px] font-semibold uppercase tracking-wide text-[#5f6573]">
              <tr>
                <th className="py-2 pr-4">Materi</th>
                <th className="py-2 pr-4">Durasi</th>
                <th className="py-2">Pemateri</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e9ef]">
              {batch.materials.map((material) => (
                <tr key={material.title}>
                  <td className="py-2.5 pr-4 font-medium text-[#172033]">{material.title}</td>
                  <td className="py-2.5 pr-4 text-[#5f6573]">{material.hours} jam</td>
                  <td className="py-2.5 text-[#5f6573]">{material.instructor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
        <div className="p-5 pb-0">
          <h2 className="text-base font-semibold text-[#172033]">Peserta</h2>
        </div>
        {batch.participants.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <Users className="size-8 text-[#5f6573]" />
            <p className="text-sm font-medium text-[#172033]">Belum ada peserta terdaftar.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase tracking-wide text-[#5f6573]">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Komisariat</th>
                  <th className="px-4 py-3">Nilai</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e9ef] text-[13px]">
                {batch.participants.map((participant) => (
                  <tr key={participant.id} className="align-middle">
                    <td className="px-4 py-3">
                      <p className="truncate text-sm font-semibold text-[#172033]">
                        {participant.fullName}
                      </p>
                      <p className="truncate text-[13px] text-[#5f6573]">
                        @{participant.username}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[#172033]">{participant.chapterName}</td>
                    <td className="px-4 py-3 text-[#172033]">{participant.score ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Lk2ParticipantStatusLabel status={participant.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            participant.status !== "passed" && participant.status !== "conditional_pass"
                          }
                          onClick={() => setCertificateTarget(participant)}
                        >
                          <Award className="size-3.5" />
                          Sertifikat
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <GenerateCertificateModal
        open={certificateTarget !== null}
        onClose={() => setCertificateTarget(null)}
        batch={batch}
        participant={certificateTarget}
      />
      <GenerateSkModal open={showSkModal} onClose={() => setShowSkModal(false)} batch={batch} />
    </div>
  );
}
