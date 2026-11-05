"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { TrainingHistoryEntry } from "@/apis/users";
import {
  createTrainingHistory,
  deleteTrainingHistory,
  updateTrainingHistory,
} from "@/lib/actions";
import type { TrainingHistoryLevelEnum, TrainingResultEnum } from "@/lib/types";
import { TRAINING_HISTORY_LEVEL_OPTIONS } from "@/lib/training-history";
import { pastYears } from "@/lib/year-options";
import Input from "../fields/Input";
import YearSelect from "../fields/YearSelect";
import Select from "../fields/Select";
import Modal from "../modals/Modal";
import ProfileEntryFormFooter from "./ProfileEntryFormFooter";
import { runProfileEntryMutation } from "@/lib/profile-entry-mutation";

const RESULT_OPTIONS: { label: string; value: TrainingResultEnum }[] = [
  { label: "Lulus", value: "passed" },
  { label: "Lulus Bersyarat", value: "conditional_pass" },
  { label: "Tidak Lulus", value: "failed" },
];

interface EditTrainingFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  // null adds a new entry; an entry edits (or deletes) that one row.
  entry: TrainingHistoryEntry | null;
}

export default function EditTrainingForm({
  open,
  onClose,
  onSaved,
  entry,
}: EditTrainingFormProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={entry ? "Edit Riwayat Kaderisasi" : "Tambah Riwayat Kaderisasi"}
    >
      {open && (
        <TrainingFields
          key={entry?.id ?? "new"}
          onClose={onClose}
          onSaved={onSaved}
          entry={entry}
        />
      )}
    </Modal>
  );
}

// Mounted only while open (and keyed by entry), so fields always seed fresh — no reset effect needed.
function TrainingFields({
  onClose,
  onSaved,
  entry,
}: Omit<EditTrainingFormProps, "open">) {
  const [level, setLevel] = useState<TrainingHistoryLevelEnum>(entry?.level ?? "LK1");
  const [result, setResult] = useState<TrainingResultEnum>(entry?.result ?? "passed");
  const [organizerName, setOrganizerName] = useState(entry?.organizer_name ?? "");
  const [year, setYear] = useState(entry ? String(entry.year) : "");
  const [isSaving, setIsSaving] = useState(false);

  function handleSubmit() {
    if (!organizerName.trim() || !year.trim()) {
      toast.error("Lengkapi penyelenggara dan tahun.");
      return;
    }
    const fields = {
      level,
      result,
      organizer_name: organizerName.trim(),
      year: Number(year),
    };
    void runProfileEntryMutation(
      () =>
        entry
          ? updateTrainingHistory({ id: entry.id, ...fields })
          : createTrainingHistory(fields),
      {
        success: entry
          ? "Riwayat kaderisasi berhasil diperbarui."
          : "Riwayat kaderisasi berhasil ditambahkan.",
        failure: "Gagal menyimpan riwayat kaderisasi.",
        setSaving: setIsSaving,
        onDone: onSaved,
        tag: "EditTrainingForm",
      }
    );
  }

  function handleDelete() {
    if (!entry) return;
    void runProfileEntryMutation(() => deleteTrainingHistory(entry.id), {
      success: "Riwayat kaderisasi berhasil dihapus.",
      failure: "Gagal menghapus riwayat kaderisasi.",
      setSaving: setIsSaving,
      onDone: onSaved,
      tag: "EditTrainingForm",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Select
        selectId="training-level"
        label="Tingkat"
        placeholder="Pilih tingkat"
        value={level}
        disabled={isSaving}
        onChange={(value) => setLevel(value as TrainingHistoryLevelEnum)}
        options={TRAINING_HISTORY_LEVEL_OPTIONS}
      />
      <Input
        inputId="training-organizer"
        label="Penyelenggara"
        placeholder="Contoh: Komisariat FH UI"
        value={organizerName}
        disabled={isSaving}
        onChange={(e) => setOrganizerName(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          selectId="training-result"
          label="Hasil"
          placeholder="Pilih hasil"
          value={result}
          disabled={isSaving}
          onChange={(value) => setResult(value as TrainingResultEnum)}
          options={RESULT_OPTIONS}
        />
        <YearSelect
          selectId="training-year"
          label="Tahun"
          value={year}
          onChange={setYear}
          years={pastYears()}
          disabled={isSaving}
          required
        />
      </div>

      <ProfileEntryFormFooter
        isSaving={isSaving}
        onCancel={onClose}
        onSubmit={handleSubmit}
        onDelete={entry ? handleDelete : undefined}
        deleteMessage="Hapus riwayat kaderisasi ini?"
      />
    </div>
  );
}
