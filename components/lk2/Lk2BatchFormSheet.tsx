"use client";

import { useState } from "react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import TextArea from "../fields/TextArea";
import Sheet from "../modals/Sheet";

interface Lk2BatchFormSheetProps {
  open: boolean;
  onClose: () => void;
}

// Prototype only — no create endpoint exists yet, "Simpan" just toasts and closes.
export default function Lk2BatchFormSheet({ open, onClose }: Lk2BatchFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Tambah Batch LK2"
      description="Buat batch Latihan Kader 2 baru di bawah Cabang ini."
    >
      {open && <Lk2BatchFields onClose={onClose} />}
    </Sheet>
  );
}

function Lk2BatchFields({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [mot, setMot] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nama angkatan wajib diisi.");
      return;
    }
    toast.info("Prototipe — form ini belum tersambung ke backend.");
    onClose();
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        inputId="lk2-batch-name"
        label="Nama Angkatan"
        placeholder="Contoh: LK2 Angkatan XV"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          inputId="lk2-batch-start-date"
          type="date"
          label="Tanggal Mulai"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <Input
          inputId="lk2-batch-end-date"
          type="date"
          label="Tanggal Selesai"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
      </div>
      <Input
        inputId="lk2-batch-location"
        label="Lokasi"
        placeholder="Contoh: Wisma Diklat Cabang"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />
      <Input
        inputId="lk2-batch-mot"
        label="Master of Training (MOT)"
        placeholder="Nama MOT"
        value={mot}
        onChange={(e) => setMot(e.target.value)}
        required
      />
      <TextArea
        textAreaId="lk2-batch-description"
        label="Deskripsi"
        placeholder="Catatan tambahan tentang batch ini..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      <div className="mt-2 flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
        <Button variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Simpan
        </Button>
      </div>
    </div>
  );
}
