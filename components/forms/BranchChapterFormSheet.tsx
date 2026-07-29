"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { ChapterListEntry } from "@/apis/chapters";
import type { Institution } from "@/apis/institutions";
import { createChapter, createInstitution, updateChapter } from "@/lib/actions";
import { isSuccessStatus, type BranchTypeEnum, type StatusEnum } from "@/lib/types";
import Button from "../buttons/Button";
import CreateableSelect, {
  type SearchableOption as CreateableOption,
} from "../fields/CreateableSelect";
import Input from "../fields/Input";
import Select from "../fields/Select";
import Sheet from "../modals/Sheet";

const TYPE_OPTIONS: { label: string; value: BranchTypeEnum }[] = [
  { label: "Penuh (Full)", value: "full" },
  { label: "Persiapan (Provisional)", value: "provisional" },
];

const STATUS_OPTIONS: { label: string; value: StatusEnum }[] = [
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

interface BranchChapterFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  chapter: ChapterListEntry | null;
  branchId: string;
}

export default function BranchChapterFormSheet({
  open,
  onClose,
  onSaved,
  chapter,
  branchId,
}: BranchChapterFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={chapter ? "Edit Komisariat" : "Tambah Komisariat"}
      description={
        chapter
          ? "Perbarui data komisariat ini."
          : "Buat komisariat (Komisariat HMI) baru di bawah Cabang ini."
      }
    >
      {open && (
        <ChapterFields
          chapter={chapter}
          branchId={branchId}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  );
}

// Mounted only while open, so state always seeds fresh from the row — no reset effect needed.
function ChapterFields({
  chapter,
  branchId,
  onClose,
  onSaved,
}: {
  chapter: ChapterListEntry | null;
  branchId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(chapter?.name ?? "");
  const [type, setType] = useState<BranchTypeEnum>(chapter?.type ?? "full");
  const [status, setStatus] = useState<StatusEnum>(chapter?.status ?? "active");
  const [institution, setInstitution] = useState<CreateableOption | null>(
    chapter?.institution_id
      ? {
          label: chapter.institution_name ?? "",
          value: chapter.institution_id,
          image: chapter.institution_avatar,
        }
      : null
  );
  const [isSaving, setIsSaving] = useState(false);

  const institutionDefaultOptions: CreateableOption[] = institution
    ? [institution]
    : [];

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
        image: item.image_url,
      })),
      hasMore: Boolean(json.hasMore),
    };
  }

  async function createInstitutionOption(
    name: string
  ): Promise<CreateableOption | null> {
    const created = await createInstitution(name);
    if (!created) return null;
    return { label: created.name, value: created.id, image: created.image_url };
  }

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nama komisariat wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const result = chapter
        ? await updateChapter({
            id: chapter.id,
            name,
            type,
            status,
            ...(institution ? { institution_id: Number(institution.value) } : {}),
          })
        : await createChapter({
            name,
            type,
            status,
            branch_id: branchId,
            ...(institution ? { institution_id: Number(institution.value) } : {}),
          });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan komisariat.");
        return;
      }

      toast.success(
        chapter ? "Komisariat berhasil diperbarui." : "Komisariat berhasil dibuat."
      );
      onSaved();
    } catch (err) {
      console.error("[BranchChapterFormSheet] save threw:", err);
      toast.error("Gagal menyimpan komisariat.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        inputId="branch-chapter-name"
        label="Nama Komisariat"
        placeholder="Contoh: HMI Komisariat Fakultas Teknik USK"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <CreateableSelect
        selectId="branch-chapter-institution"
        label="Asal Universitas"
        placeholder="Cari universitas..."
        value={institution}
        onChange={setInstitution}
        loadOptions={loadInstitutionOptions}
        defaultOptions={institutionDefaultOptions}
        onCreateOption={createInstitutionOption}
      />
      <Select
        selectId="branch-chapter-type"
        label="Tipe"
        placeholder="Pilih tipe"
        value={type}
        onChange={(value) => setType(value as BranchTypeEnum)}
        options={TYPE_OPTIONS}
        required
      />
      <Select
        selectId="branch-chapter-status"
        label="Status"
        placeholder="Pilih status"
        value={status}
        onChange={(value) => setStatus(value as StatusEnum)}
        options={STATUS_OPTIONS}
        required
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
