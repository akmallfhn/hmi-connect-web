"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { OrganizationExperienceEntry } from "@/apis/users";
import {
  createOrganizationExperience,
  deleteOrganizationExperience,
  updateOrganizationExperience,
} from "@/lib/actions";
import Input from "../fields/Input";
import TextArea from "../fields/TextArea";
import YearSelect from "../fields/YearSelect";
import Modal from "../modals/Modal";
import ProfileEntryFormFooter from "./ProfileEntryFormFooter";
import { pastYears } from "@/lib/year-options";
import { runProfileEntryMutation } from "./profile-entry-mutation";

interface EditOrganizationExperienceFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  // null adds a new entry; an entry edits (or deletes) that one row.
  entry: OrganizationExperienceEntry | null;
}

export default function EditOrganizationExperienceForm({
  open,
  onClose,
  onSaved,
  entry,
}: EditOrganizationExperienceFormProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={entry ? "Edit Pengalaman Organisasi" : "Tambah Pengalaman Organisasi"}
    >
      {open && (
        <OrganizationExperienceFields
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
function OrganizationExperienceFields({
  onClose,
  onSaved,
  entry,
}: Omit<EditOrganizationExperienceFormProps, "open">) {
  const [organizationName, setOrganizationName] = useState(
    entry?.organization_name ?? ""
  );
  const [positionTitle, setPositionTitle] = useState(entry?.position_title ?? "");
  const [startYear, setStartYear] = useState(entry ? String(entry.start_year) : "");
  const [endYear, setEndYear] = useState(entry?.end_year ? String(entry.end_year) : "");
  const [isOngoing, setIsOngoing] = useState(entry ? !entry.end_year : false);
  const [description, setDescription] = useState(entry?.description ?? "");
  const [isSaving, setIsSaving] = useState(false);

  function handleSubmit() {
    if (!organizationName.trim() || !positionTitle.trim() || !startYear.trim()) {
      toast.error("Lengkapi organisasi, jabatan, dan tahun mulai.");
      return;
    }
    if (!isOngoing && !endYear.trim()) {
      toast.error("Pilih tahun selesai, atau centang jika masih berlangsung.");
      return;
    }
    const start = Number(startYear);
    const end = isOngoing ? null : Number(endYear);
    if (end !== null && end < start) {
      toast.error("Tahun selesai tidak boleh sebelum tahun mulai.");
      return;
    }
    const fields = {
      organization_name: organizationName.trim(),
      position_title: positionTitle.trim(),
      start_year: start,
      description: description.trim(),
    };
    void runProfileEntryMutation(
      () =>
        entry
          ? updateOrganizationExperience({ id: entry.id, ...fields, end_year: end ?? 0 })
          : createOrganizationExperience({ ...fields, end_year: end ?? undefined }),
      {
        success: entry
          ? "Pengalaman organisasi berhasil diperbarui."
          : "Pengalaman organisasi berhasil ditambahkan.",
        failure: "Gagal menyimpan pengalaman organisasi.",
        setSaving: setIsSaving,
        onDone: onSaved,
        tag: "EditOrganizationExperienceForm",
      }
    );
  }

  function handleDelete() {
    if (!entry) return;
    void runProfileEntryMutation(() => deleteOrganizationExperience(entry.id), {
      success: "Pengalaman organisasi berhasil dihapus.",
      failure: "Gagal menghapus pengalaman organisasi.",
      setSaving: setIsSaving,
      onDone: onSaved,
      tag: "EditOrganizationExperienceForm",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        inputId="org-name"
        label="Organisasi"
        placeholder="Contoh: HMI Cabang Banda Aceh"
        value={organizationName}
        disabled={isSaving}
        onChange={(e) => setOrganizationName(e.target.value)}
        required
      />
      <Input
        inputId="org-position"
        label="Jabatan"
        placeholder="Contoh: Ketua Bidang PTKP"
        value={positionTitle}
        disabled={isSaving}
        onChange={(e) => setPositionTitle(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <YearSelect
          selectId="org-start"
          label="Tahun Mulai"
          value={startYear}
          onChange={setStartYear}
          years={pastYears()}
          disabled={isSaving}
          required
        />
        {!isOngoing && (
          <YearSelect
            selectId="org-end"
            label="Tahun Selesai"
            value={endYear}
            onChange={setEndYear}
            years={pastYears()}
            minYear={startYear ? Number(startYear) : undefined}
            disabled={isSaving}
            required
          />
        )}
      </div>
      <label
        htmlFor="org-ongoing"
        className="flex w-fit cursor-pointer items-center gap-2 text-sm text-heading select-none"
      >
        <input
          id="org-ongoing"
          type="checkbox"
          checked={isOngoing}
          onChange={(e) => setIsOngoing(e.target.checked)}
          className="size-4 rounded border-border-strong accent-primary"
          disabled={isSaving}
        />
        Saya masih aktif berorganisasi di sini
      </label>
      <TextArea
        textAreaId="org-description"
        label="Deskripsi"
        placeholder="Ceritakan peran atau program yang pernah kamu jalankan"
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
        deleteMessage="Hapus pengalaman organisasi ini?"
      />
    </div>
  );
}
