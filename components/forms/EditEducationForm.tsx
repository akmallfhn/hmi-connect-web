"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Institution } from "@/apis/institutions";
import type { EducationHistoryEntry } from "@/apis/users";
import {
  createEducationHistory,
  createInstitution,
  deleteEducationHistory,
  updateEducationHistory,
} from "@/lib/actions";
import { DEGREE_OPTIONS } from "@/lib/education";
import { isSuccessStatus, type Degree } from "@/lib/types";
import { graduationYears, pastYears } from "@/lib/year-options";
import CreateableSelect, {
  type SearchableOption,
} from "../fields/CreateableSelect";
import Input from "../fields/Input";
import Select from "../fields/Select";
import YearSelect from "../fields/YearSelect";
import Modal from "../modals/Modal";
import ProfileEntryFormFooter from "./ProfileEntryFormFooter";

interface EditEducationFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  // null adds a new entry; an entry edits (or deletes) that one row.
  entry: EducationHistoryEntry | null;
  institutions: Institution[];
}

export default function EditEducationForm({
  open,
  onClose,
  onSaved,
  entry,
  institutions,
}: EditEducationFormProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={entry ? "Edit Pendidikan" : "Tambah Pendidikan"}
    >
      {open && (
        <EducationFields
          key={entry?.id ?? "new"}
          onClose={onClose}
          onSaved={onSaved}
          entry={entry}
          institutions={institutions}
        />
      )}
    </Modal>
  );
}

async function loadInstitutionOptions(inputValue: string, page: number) {
  const params = new URLSearchParams({ page: String(page) });
  if (inputValue) params.set("q", inputValue);

  const response = await fetch(`/api/institutions/search?${params}`);
  const json = await response.json();
  const results: Institution[] = json.data ?? [];

  return {
    options: results.map((item) => ({
      label: item.name,
      value: item.id,
      image: item.image_url ?? undefined,
    })),
    hasMore: Boolean(json.hasMore),
  };
}

async function createInstitutionOption(
  name: string
): Promise<SearchableOption | null> {
  const created = await createInstitution(name);
  if (!created) return null;
  return {
    label: created.name,
    value: created.id,
    image: created.image_url ?? undefined,
  };
}

// Mounted only while open (and keyed by entry), so fields always seed fresh — no reset effect needed.
function EducationFields({
  onClose,
  onSaved,
  entry,
  institutions,
}: Omit<EditEducationFormProps, "open">) {
  const [institution, setInstitution] = useState<SearchableOption | null>(
    entry
      ? {
          label: entry.institution_name,
          value: entry.institution_id,
          image: entry.image_url,
        }
      : null
  );
  const [degree, setDegree] = useState<Degree>(entry?.degree ?? "sarjana");
  const [major, setMajor] = useState(entry?.major ?? "");
  const [startYear, setStartYear] = useState(
    entry ? String(entry.start_year) : ""
  );
  const [endYear, setEndYear] = useState(
    entry?.end_year ? String(entry.end_year) : ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const institutionOptions: SearchableOption[] = institutions.map((item) => ({
    label: item.name,
    value: item.id,
    image: item.image_url ?? undefined,
  }));

  async function handleSubmit() {
    if (!institution) {
      toast.error("Pilih universitas terlebih dahulu.");
      return;
    }
    const start = Number(startYear);
    if (!startYear.trim() || !Number.isInteger(start)) {
      toast.error("Tahun masuk wajib diisi.");
      return;
    }
    if (!endYear.trim()) {
      toast.error("Tahun lulus (perkiraan) wajib diisi.");
      return;
    }
    const end = Number(endYear);
    if (end < start) {
      toast.error("Tahun lulus tidak boleh sebelum tahun masuk.");
      return;
    }

    setIsSaving(true);
    try {
      const result = entry
        ? await updateEducationHistory({
            id: entry.id,
            institution_id: Number(institution.value),
            degree,
            major,
            start_year: start,
            end_year: end,
          })
        : await createEducationHistory({
            institution_id: Number(institution.value),
            degree,
            major,
            start_year: start,
            end_year: end,
          });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan pendidikan.");
        return;
      }
      toast.success(
        entry ? "Pendidikan berhasil diperbarui." : "Pendidikan berhasil ditambahkan."
      );
      onSaved();
    } catch (err) {
      console.error("[EditEducationForm] save threw:", err);
      toast.error("Gagal menyimpan pendidikan.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!entry) return;
    setIsSaving(true);
    try {
      const result = await deleteEducationHistory(entry.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menghapus pendidikan.");
        return;
      }
      toast.success("Pendidikan berhasil dihapus.");
      onSaved();
    } catch (err) {
      console.error("[EditEducationForm] delete threw:", err);
      toast.error("Gagal menghapus pendidikan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <CreateableSelect
        selectId="edu-institution"
        label="Universitas"
        placeholder="Cari universitas..."
        value={institution}
        onChange={setInstitution}
        loadOptions={loadInstitutionOptions}
        defaultOptions={institutionOptions}
        onCreateOption={createInstitutionOption}
        createLabel={(input) => `Tambah universitas "${input}"`}
        debounceMs={400}
        disabled={isSaving}
        required
      />
      <Input
        inputId="edu-major"
        label="Jurusan"
        placeholder="Contoh: Teknik Informatika"
        value={major}
        disabled={isSaving}
        onChange={(e) => setMajor(e.target.value)}
      />
      <Select
        selectId="edu-degree"
        label="Jenjang Pendidikan"
        placeholder="Pilih jenjang"
        value={degree}
        disabled={isSaving}
        onChange={(value) => setDegree(value as Degree)}
        options={DEGREE_OPTIONS}
      />
      <div className="grid grid-cols-2 gap-4">
        <YearSelect
          selectId="edu-start"
          label="Tahun Masuk"
          value={startYear}
          onChange={setStartYear}
          years={pastYears()}
          disabled={isSaving}
          required
        />
        <YearSelect
          selectId="edu-end"
          label="Tahun Lulus (perkiraan)"
          value={endYear}
          onChange={setEndYear}
          years={graduationYears()}
          minYear={startYear ? Number(startYear) : undefined}
          disabled={isSaving}
          required
        />
      </div>

      <ProfileEntryFormFooter
        isSaving={isSaving}
        onCancel={onClose}
        onSubmit={() => void handleSubmit()}
        onDelete={entry ? () => void handleDelete() : undefined}
        deleteMessage="Hapus riwayat pendidikan ini?"
      />
    </div>
  );
}
