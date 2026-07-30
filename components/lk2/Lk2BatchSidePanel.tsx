"use client";

import {
  Award,
  CalendarDays,
  Copy,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  MapPin,
  Megaphone,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Lk2BatchStatusLabel } from "./Lk2Labels";
import type { Lk2Batch } from "./mockData";

interface Lk2BatchSidePanelProps {
  batch: Lk2Batch;
  onGenerateSk: () => void;
}

function formatDateRange(startDate: string, endDate: string) {
  const format = (value: string) =>
    new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  return `${format(startDate)} – ${format(endDate)}`;
}

function formatCreatedAt(value: string) {
  return (
    new Date(value).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
}

function notWired() {
  toast.info("Prototipe — fitur ini belum tersambung ke backend.");
}

function QuickActionButton({
  icon: Icon,
  iconClassName,
  label,
  onClick,
}: {
  icon: typeof FileCheck2;
  iconClassName: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[#e6e9ef] px-3 py-2.5 text-left text-sm font-medium text-[#172033] transition hover:bg-[#f5f7fb]"
    >
      <Icon className={`size-4 shrink-0 ${iconClassName}`} />
      {label}
    </button>
  );
}

// Prototype only — right-column companion to the Ringkasan tab, no real API behind any of it.
export default function Lk2BatchSidePanel({ batch, onGenerateSk }: Lk2BatchSidePanelProps) {
  function copyBatchCode() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(batch.batchCode).catch(() => {});
    }
    toast.success("Batch ID disalin.");
  }

  return (
    <div className="flex w-full flex-col gap-4 lg:w-80 lg:shrink-0">
      <div className="overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
        <div className="relative h-24 bg-gradient-to-br from-primary to-[#0d6b4a]">
          <div className="absolute top-3 right-3">
            <Lk2BatchStatusLabel status={batch.status} />
          </div>
        </div>
        <div className="p-4">
          <p className="text-base font-bold text-[#172033]">{batch.name}</p>
          <div className="mt-2 flex flex-col gap-1.5 text-sm text-[#5f6573]">
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
          <div className="mt-4 flex flex-col gap-2 border-t border-[#e6e9ef] pt-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#5f6573]">Batch ID</span>
              <button
                type="button"
                onClick={copyBatchCode}
                className="flex cursor-pointer items-center gap-1.5 font-medium text-[#172033] hover:text-primary"
              >
                {batch.batchCode}
                <Copy className="size-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#5f6573]">Dibuat oleh</span>
              <span className="truncate font-medium text-[#172033]">{batch.createdBy}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#5f6573]">Dibuat pada</span>
              <span className="truncate font-medium text-[#172033]">
                {formatCreatedAt(batch.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#e6e9ef] bg-white p-4">
        <p className="text-sm font-bold text-[#172033]">Quick Action</p>
        <div className="mt-3 flex flex-col gap-2">
          <QuickActionButton
            icon={FileCheck2}
            iconClassName="text-primary"
            label="Generate SK Kelulusan"
            onClick={onGenerateSk}
          />
          <QuickActionButton
            icon={FileSpreadsheet}
            iconClassName="text-[#164EA6]"
            label="Export Rekap Peserta"
            onClick={notWired}
          />
          <QuickActionButton
            icon={Award}
            iconClassName="text-[#8A6300]"
            label="Cetak Sertifikat Massal"
            onClick={notWired}
          />
          <QuickActionButton
            icon={Megaphone}
            iconClassName="text-secondary"
            label="Kirim Pengumuman"
            onClick={notWired}
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#e6e9ef] bg-white p-4">
        <p className="text-sm font-bold text-[#172033]">Dokumen Batch</p>
        <div className="mt-3 flex flex-col gap-2">
          {batch.documents.length === 0 ? (
            <p className="text-sm text-[#5f6573]">Belum ada dokumen.</p>
          ) : (
            batch.documents.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center gap-3 rounded-lg border border-[#e6e9ef] px-3 py-2.5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f5f7fb]">
                  <FileText className="size-4 text-[#5f6573]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#172033]">{doc.name}</p>
                  <p className="text-xs text-[#5f6573]">{doc.sizeLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={notWired}
                  aria-label="Unduh dokumen"
                  className="cursor-pointer text-[#5f6573] hover:text-primary"
                >
                  <Download className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
