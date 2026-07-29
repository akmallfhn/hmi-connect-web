"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import Modal from "../modals/Modal";
import type { Lk2Batch, Lk2Participant } from "./mockData";

interface GenerateCertificateModalProps {
  open: boolean;
  onClose: () => void;
  batch: Lk2Batch;
  participant: Lk2Participant | null;
}

// Prototype only — preview + a button that just toasts, no real PDF generation.
export default function GenerateCertificateModal({
  open,
  onClose,
  batch,
  participant,
}: GenerateCertificateModalProps) {
  if (!participant) return null;

  const statusText = participant.status === "passed" ? "LULUS" : "LULUS BERSYARAT";

  return (
    <Modal open={open} onClose={onClose} title="Sertifikat Kelulusan" panelClassName="max-w-xl">
      <div className="rounded-xl border-4 border-double border-primary/40 bg-primary-soft/20 p-6 text-center">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          Himpunan Mahasiswa Islam
        </p>
        <p className="mt-1 text-lg font-bold text-[#172033]">Sertifikat Kelulusan</p>
        <p className="mt-4 text-sm text-[#5f6573]">Diberikan kepada</p>
        <p className="mt-1 text-2xl font-bold text-[#172033]">{participant.fullName}</p>
        <p className="text-sm text-[#5f6573]">@{participant.username}</p>
        <p className="mt-4 text-sm text-[#5f6573]">
          Atas dinyatakan <span className="font-semibold text-primary">{statusText}</span> dalam
        </p>
        <p className="mt-1 text-base font-semibold text-[#172033]">{batch.name}</p>
        <p className="text-sm text-[#5f6573]">
          {batch.location} · {batch.startDate} s.d. {batch.endDate}
        </p>
        <div className="mt-6 flex flex-col items-center gap-0.5">
          <p className="text-sm font-semibold text-[#172033]">{batch.mot}</p>
          <p className="text-xs text-[#5f6573]">Master of Training (MOT)</p>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Tutup
        </Button>
        <Button
          variant="primary"
          onClick={() =>
            toast.info("Prototipe — unduh sertifikat belum tersambung ke backend.")
          }
        >
          <Download className="size-4" />
          Unduh Sertifikat (PDF)
        </Button>
      </div>
    </Modal>
  );
}
