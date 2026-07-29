"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import Modal from "../modals/Modal";
import type { Lk2Batch } from "./mockData";

interface GenerateSkModalProps {
  open: boolean;
  onClose: () => void;
  batch: Lk2Batch;
}

// Prototype only — preview + a button that just toasts, no real PDF generation.
export default function GenerateSkModal({ open, onClose, batch }: GenerateSkModalProps) {
  const graduates = batch.participants.filter(
    (participant) => participant.status === "passed" || participant.status === "conditional_pass"
  );

  return (
    <Modal open={open} onClose={onClose} title="SK Kelulusan" panelClassName="max-w-xl">
      <div className="rounded-xl border border-[#e6e9ef] bg-white p-6">
        <div className="border-b border-[#e6e9ef] pb-4 text-center">
          <p className="text-sm font-semibold text-[#172033]">
            HIMPUNAN MAHASISWA ISLAM (HMI)
          </p>
          <p className="mt-3 text-base font-bold text-[#172033]">SURAT KEPUTUSAN</p>
          <p className="text-sm text-[#5f6573]">Nomor: 001/SK/LK2/{batch.id.toUpperCase()}</p>
          <p className="mt-2 text-sm font-medium text-[#172033]">
            TENTANG KELULUSAN PESERTA
          </p>
          <p className="text-sm font-medium text-[#172033]">{batch.name.toUpperCase()}</p>
        </div>

        <div className="mt-4">
          <p className="text-sm text-[#5f6573]">
            Menetapkan nama-nama berikut sebagai peserta yang dinyatakan lulus:
          </p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-[#172033]">
            {graduates.length === 0 ? (
              <li className="list-none text-[#5f6573]">
                Belum ada peserta yang dinyatakan lulus.
              </li>
            ) : (
              graduates.map((participant) => (
                <li key={participant.id}>
                  {participant.fullName}{" "}
                  <span className="text-[#5f6573]">
                    ({participant.status === "passed" ? "Lulus" : "Lulus Bersyarat"})
                  </span>
                </li>
              ))
            )}
          </ol>
        </div>

        <div className="mt-6 flex flex-col items-center gap-0.5 text-center">
          <p className="text-sm text-[#5f6573]">Ditetapkan di {batch.location}</p>
          <p className="mt-4 text-sm font-semibold text-[#172033]">{batch.mot}</p>
          <p className="text-xs text-[#5f6573]">Master of Training (MOT)</p>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Tutup
        </Button>
        <Button
          variant="primary"
          onClick={() => toast.info("Prototipe — unduh SK belum tersambung ke backend.")}
        >
          <Download className="size-4" />
          Unduh SK Kelulusan (PDF)
        </Button>
      </div>
    </Modal>
  );
}
