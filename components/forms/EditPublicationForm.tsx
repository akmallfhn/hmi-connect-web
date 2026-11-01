"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { PublicationEntry } from "@/apis/users";
import { createPublication, deletePublication, updatePublication } from "@/lib/actions";
import { pastYears } from "@/lib/year-options";
import Input from "../fields/Input";
import YearSelect from "../fields/YearSelect";
import TextArea from "../fields/TextArea";
import Modal from "../modals/Modal";
import ProfileEntryFormFooter from "./ProfileEntryFormFooter";
import { runProfileEntryMutation } from "./profile-entry-mutation";

interface EditPublicationFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  // null adds a new entry; an entry edits (or deletes) that one row.
  entry: PublicationEntry | null;
}

export default function EditPublicationForm({
  open,
  onClose,
  onSaved,
  entry,
}: EditPublicationFormProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={entry ? "Edit Publikasi" : "Tambah Publikasi"}
    >
      {open && (
        <PublicationFields
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
function PublicationFields({
  onClose,
  onSaved,
  entry,
}: Omit<EditPublicationFormProps, "open">) {
  const [title, setTitle] = useState(entry?.title ?? "");
  const [publisher, setPublisher] = useState(entry?.publisher ?? "");
  const [year, setYear] = useState(entry ? String(entry.year) : "");
  const [url, setUrl] = useState(entry?.url ?? "");
  const [description, setDescription] = useState(entry?.description ?? "");
  const [isSaving, setIsSaving] = useState(false);

  function handleSubmit() {
    if (!title.trim() || !publisher.trim() || !year.trim()) {
      toast.error("Lengkapi judul, penerbit, dan tahun.");
      return;
    }
    const fields = {
      title: title.trim(),
      publisher: publisher.trim(),
      year: Number(year),
      url: url.trim(),
      description: description.trim(),
    };
    void runProfileEntryMutation(
      () => (entry ? updatePublication({ id: entry.id, ...fields }) : createPublication(fields)),
      {
        success: entry ? "Publikasi berhasil diperbarui." : "Publikasi berhasil ditambahkan.",
        failure: "Gagal menyimpan publikasi.",
        setSaving: setIsSaving,
        onDone: onSaved,
        tag: "EditPublicationForm",
      }
    );
  }

  function handleDelete() {
    if (!entry) return;
    void runProfileEntryMutation(() => deletePublication(entry.id), {
      success: "Publikasi berhasil dihapus.",
      failure: "Gagal menghapus publikasi.",
      setSaving: setIsSaving,
      onDone: onSaved,
      tag: "EditPublicationForm",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        inputId="publication-title"
        label="Judul"
        placeholder="Contoh: Strategi Kaderisasi di Era Digital"
        value={title}
        disabled={isSaving}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Input
        inputId="publication-publisher"
        label="Penerbit"
        placeholder="Contoh: Jurnal Kepemimpinan HMI"
        value={publisher}
        disabled={isSaving}
        onChange={(e) => setPublisher(e.target.value)}
        required
      />
      <YearSelect
        selectId="publication-year"
        label="Tahun"
        value={year}
        onChange={setYear}
        years={pastYears()}
        disabled={isSaving}
        required
      />
      <Input
        inputId="publication-url"
        label="Tautan"
        type="url"
        placeholder="https://example.com/publikasi"
        value={url}
        disabled={isSaving}
        onChange={(e) => setUrl(e.target.value)}
      />
      <TextArea
        textAreaId="publication-description"
        label="Deskripsi"
        placeholder="Ceritakan konteks publikasi ini"
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
        deleteMessage="Hapus publikasi ini?"
      />
    </div>
  );
}
