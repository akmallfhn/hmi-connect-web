"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { WorkExperienceEntry } from "@/apis/users";
import {
  createWorkExperience,
  deleteWorkExperience,
  updateWorkExperience,
} from "@/lib/actions";
import Input from "../fields/Input";
import TextArea from "../fields/TextArea";
import YearSelect from "../fields/YearSelect";
import Modal from "../modals/Modal";
import ProfileEntryFormFooter from "./ProfileEntryFormFooter";
import { pastYears } from "@/lib/year-options";
import { runProfileEntryMutation } from "./profile-entry-mutation";

interface EditWorkExperienceFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  // null adds a new entry; an entry edits (or deletes) that one row.
  entry: WorkExperienceEntry | null;
}

export default function EditWorkExperienceForm({
  open,
  onClose,
  onSaved,
  entry,
}: EditWorkExperienceFormProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={entry ? "Edit Pengalaman Kerja" : "Tambah Pengalaman Kerja"}
    >
      {open && (
        <WorkExperienceFields
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
function WorkExperienceFields({
  onClose,
  onSaved,
  entry,
}: Omit<EditWorkExperienceFormProps, "open">) {
  const [companyName, setCompanyName] = useState(entry?.company_name ?? "");
  const [positionTitle, setPositionTitle] = useState(entry?.position_title ?? "");
  const [startYear, setStartYear] = useState(entry ? String(entry.start_year) : "");
  const [endYear, setEndYear] = useState(entry?.end_year ? String(entry.end_year) : "");
  const [isOngoing, setIsOngoing] = useState(entry ? !entry.end_year : false);
  const [description, setDescription] = useState(entry?.description ?? "");
  const [isSaving, setIsSaving] = useState(false);

  function handleSubmit() {
    if (!companyName.trim() || !positionTitle.trim() || !startYear.trim()) {
      toast.error("Lengkapi perusahaan, jabatan, dan tahun mulai.");
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
      company_name: companyName.trim(),
      position_title: positionTitle.trim(),
      start_year: start,
      description: description.trim(),
    };
    void runProfileEntryMutation(
      () =>
        entry
          ? updateWorkExperience({ id: entry.id, ...fields, end_year: end ?? 0 })
          : createWorkExperience({ ...fields, end_year: end ?? undefined }),
      {
        success: entry
          ? "Pengalaman kerja berhasil diperbarui."
          : "Pengalaman kerja berhasil ditambahkan.",
        failure: "Gagal menyimpan pengalaman kerja.",
        setSaving: setIsSaving,
        onDone: onSaved,
        tag: "EditWorkExperienceForm",
      }
    );
  }

  function handleDelete() {
    if (!entry) return;
    void runProfileEntryMutation(() => deleteWorkExperience(entry.id), {
      success: "Pengalaman kerja berhasil dihapus.",
      failure: "Gagal menghapus pengalaman kerja.",
      setSaving: setIsSaving,
      onDone: onSaved,
      tag: "EditWorkExperienceForm",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        inputId="work-company"
        label="Perusahaan"
        placeholder="Contoh: PT HMI Digital Indonesia"
        value={companyName}
        disabled={isSaving}
        onChange={(e) => setCompanyName(e.target.value)}
        required
      />
      <Input
        inputId="work-position"
        label="Jabatan"
        placeholder="Contoh: Software Engineer"
        value={positionTitle}
        disabled={isSaving}
        onChange={(e) => setPositionTitle(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <YearSelect
          selectId="work-start"
          label="Tahun Mulai"
          value={startYear}
          onChange={setStartYear}
          years={pastYears()}
          disabled={isSaving}
          required
        />
        {!isOngoing && (
          <YearSelect
            selectId="work-end"
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
        htmlFor="work-ongoing"
        className="flex w-fit cursor-pointer items-center gap-2 text-sm text-heading select-none"
      >
        <input
          id="work-ongoing"
          type="checkbox"
          checked={isOngoing}
          onChange={(e) => setIsOngoing(e.target.checked)}
          className="size-4 rounded border-border-strong accent-primary"
          disabled={isSaving}
        />
        Saya masih bekerja di sini
      </label>
      <TextArea
        textAreaId="work-description"
        label="Deskripsi"
        placeholder="Ceritakan tanggung jawab atau pencapaian di posisi ini"
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
        deleteMessage="Hapus pengalaman kerja ini?"
      />
    </div>
  );
}
