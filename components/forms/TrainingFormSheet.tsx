"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { TrainingDetail } from "@/apis/trainings";
import { createTraining, updateTraining } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import TextArea from "../fields/TextArea";
import Sheet from "../modals/Sheet";

interface TrainingFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  branchId: string;
  training: TrainingDetail | null;
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function TrainingFormSheet({
  open,
  onClose,
  onSaved,
  branchId,
  training,
}: TrainingFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={training ? "Edit Batch LK2" : "Tambah Batch LK2"}
      description={
        training
          ? "Perbarui informasi pelaksanaan Latihan Kader 2."
          : "Buat pelaksanaan Latihan Kader 2 di bawah Cabang ini."
      }
    >
      {open && (
        <TrainingFields
          branchId={branchId}
          training={training}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  );
}

function TrainingFields({
  branchId,
  training,
  onClose,
  onSaved,
}: Omit<TrainingFormSheetProps, "open">) {
  const [name, setName] = useState(training?.name ?? "");
  const [description, setDescription] = useState(training?.description ?? "");
  const [startDate, setStartDate] = useState(training?.start_date ?? "");
  const [endDate, setEndDate] = useState(training?.end_date ?? "");
  const [locationName, setLocationName] = useState(
    training?.location_name ?? ""
  );
  const [locationUrl, setLocationUrl] = useState(training?.location_url ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !startDate || !endDate) {
      toast.error("Nama dan tanggal pelaksanaan wajib diisi.");
      return;
    }
    if (endDate < startDate) {
      toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }
    if (locationUrl.trim() && !isValidHttpUrl(locationUrl.trim())) {
      toast.error("Tautan lokasi harus berupa URL http atau https yang valid.");
      return;
    }

    setIsSaving(true);
    try {
      const result = training
        ? await updateTraining({
            id: training.id,
            name: name.trim(),
            description: description.trim(),
            start_date: startDate,
            end_date: endDate,
            location_name: locationName.trim(),
            location_url: locationUrl.trim(),
          })
        : await createTraining({
            name: name.trim(),
            ...(description.trim() ? { description: description.trim() } : {}),
            level: "LK2",
            organizer_type: "branch",
            organizer_id: branchId,
            start_date: startDate,
            end_date: endDate,
            ...(locationName.trim()
              ? { location_name: locationName.trim() }
              : {}),
            ...(locationUrl.trim()
              ? { location_url: locationUrl.trim() }
              : {}),
          });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan batch LK2.");
        return;
      }
      toast.success(
        training ? "Batch LK2 berhasil diperbarui." : "Batch LK2 berhasil dibuat."
      );
      onSaved();
    } catch (error) {
      console.error("[TrainingFormSheet] save threw:", error);
      toast.error("Gagal menyimpan batch LK2.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        inputId="training-name"
        label="Nama Batch"
        placeholder="Contoh: LK2 HMI Cabang Banda Aceh 2026"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <TextArea
        textAreaId="training-description"
        label="Deskripsi"
        placeholder="Deskripsi singkat pelaksanaan LK2"
        rows={4}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          inputId="training-start-date"
          label="Tanggal Mulai"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          required
        />
        <Input
          inputId="training-end-date"
          label="Tanggal Selesai"
          type="date"
          min={startDate || undefined}
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          required
        />
      </div>
      <Input
        inputId="training-location-name"
        label="Lokasi"
        placeholder="Contoh: Aula Insan Cita"
        value={locationName}
        onChange={(event) => setLocationName(event.target.value)}
      />
      <Input
        inputId="training-location-url"
        label="Tautan Lokasi"
        type="url"
        placeholder="https://maps.google.com/..."
        value={locationUrl}
        onChange={(event) => setLocationUrl(event.target.value)}
      />

      <div className="mt-2 flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
