"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { HonorAwardEntry } from "@/apis/users";
import { createHonorAward, deleteHonorAward, updateHonorAward } from "@/lib/actions";
import { pastYears } from "@/lib/year-options";
import Input from "../fields/Input";
import YearSelect from "../fields/YearSelect";
import TextArea from "../fields/TextArea";
import Modal from "../modals/Modal";
import ProfileEntryFormFooter from "./ProfileEntryFormFooter";
import { runProfileEntryMutation } from "@/lib/profile-entry-mutation";

interface EditHonorAwardFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  // null adds a new entry; an entry edits (or deletes) that one row.
  entry: HonorAwardEntry | null;
}

export default function EditHonorAwardForm({
  open,
  onClose,
  onSaved,
  entry,
}: EditHonorAwardFormProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={entry ? "Edit Penghargaan" : "Tambah Penghargaan"}
    >
      {open && (
        <HonorAwardFields
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
function HonorAwardFields({
  onClose,
  onSaved,
  entry,
}: Omit<EditHonorAwardFormProps, "open">) {
  const [title, setTitle] = useState(entry?.title ?? "");
  const [issuer, setIssuer] = useState(entry?.issuer ?? "");
  const [year, setYear] = useState(entry ? String(entry.year) : "");
  const [description, setDescription] = useState(entry?.description ?? "");
  const [isSaving, setIsSaving] = useState(false);

  function handleSubmit() {
    if (!title.trim() || !issuer.trim() || !year.trim()) {
      toast.error("Lengkapi judul, penerbit, dan tahun.");
      return;
    }
    const fields = {
      title: title.trim(),
      issuer: issuer.trim(),
      year: Number(year),
      description: description.trim(),
    };
    void runProfileEntryMutation(
      () => (entry ? updateHonorAward({ id: entry.id, ...fields }) : createHonorAward(fields)),
      {
        success: entry ? "Penghargaan berhasil diperbarui." : "Penghargaan berhasil ditambahkan.",
        failure: "Gagal menyimpan penghargaan.",
        setSaving: setIsSaving,
        onDone: onSaved,
        tag: "EditHonorAwardForm",
      }
    );
  }

  function handleDelete() {
    if (!entry) return;
    void runProfileEntryMutation(() => deleteHonorAward(entry.id), {
      success: "Penghargaan berhasil dihapus.",
      failure: "Gagal menghapus penghargaan.",
      setSaving: setIsSaving,
      onDone: onSaved,
      tag: "EditHonorAwardForm",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        inputId="honor-title"
        label="Judul"
        placeholder="Contoh: Kader Teladan"
        value={title}
        disabled={isSaving}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Input
        inputId="honor-issuer"
        label="Penerbit"
        placeholder="Contoh: HMI Cabang Banda Aceh"
        value={issuer}
        disabled={isSaving}
        onChange={(e) => setIssuer(e.target.value)}
        required
      />
      <YearSelect
        selectId="honor-year"
        label="Tahun"
        value={year}
        onChange={setYear}
        years={pastYears()}
        disabled={isSaving}
        required
      />
      <TextArea
        textAreaId="honor-description"
        label="Deskripsi"
        placeholder="Ceritakan konteks penghargaan ini"
        value={description}
        disabled={isSaving}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        characterLength={240}
      />

      <ProfileEntryFormFooter
        isSaving={isSaving}
        onCancel={onClose}
        onSubmit={handleSubmit}
        onDelete={entry ? handleDelete : undefined}
        deleteMessage="Hapus penghargaan ini?"
      />
    </div>
  );
}
