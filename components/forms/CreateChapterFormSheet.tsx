"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Institution } from "@/apis/institutions";
import { createChapter, createInstitution } from "@/lib/actions";
import { isSuccessStatus, type BranchTypeEnum, type StatusEnum } from "@/lib/types";
import Button from "../buttons/Button";
import CreateableSelect, {
  type SearchableOption as CreateableOption,
} from "../fields/CreateableSelect";
import Input from "../fields/Input";
import Select from "../fields/Select";
import SearchableSelect, { type SearchableOption } from "../fields/SearchableSelect";
import TextArea from "../fields/TextArea";
import Sheet from "../modals/Sheet";
import ChapterLogoField from "./ChapterLogoField";

const TYPE_OPTIONS: { label: string; value: BranchTypeEnum }[] = [
  { label: "Penuh (Full)", value: "full" },
  { label: "Persiapan (Provisional)", value: "provisional" },
];

const STATUS_OPTIONS: { label: string; value: StatusEnum }[] = [
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

interface CreateChapterFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  defaultBranch?: SearchableOption | null;
  // When true, the Cabang field renders as fixed, read-only text instead of a searchable picker — used from a Cabang's own scoped "Kelola Komisariat" page so a new Komisariat can't be attached to another Cabang.
  lockBranch?: boolean;
}

export default function CreateChapterFormSheet({
  open,
  onClose,
  onSaved,
  defaultBranch = null,
  lockBranch = false,
}: CreateChapterFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Tambah Komisariat"
      description="Buat Komisariat HMI baru di bawah sebuah Cabang."
    >
      {open && (
        <CreateChapterFields
          defaultBranch={defaultBranch}
          lockBranch={lockBranch}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  );
}

// Mounted only while open, so state always starts fresh — no reset effect needed.
function CreateChapterFields({
  defaultBranch,
  lockBranch,
  onClose,
  onSaved,
}: {
  defaultBranch: SearchableOption | null;
  lockBranch: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [type, setType] = useState<BranchTypeEnum>("full");
  const [status, setStatus] = useState<StatusEnum>("active");
  const [branch, setBranch] = useState<SearchableOption | null>(defaultBranch);
  const [institution, setInstitution] = useState<CreateableOption | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  async function loadBranchOptions(inputValue: string, page: number) {
    const params = new URLSearchParams({ page: String(page) });
    if (inputValue) params.set("q", inputValue);
    const response = await fetch(`/api/branches/search?${params}`);
    const json = await response.json();
    const results: { id: string; name: string }[] = json.data ?? [];
    return {
      options: results.map((item) => ({ label: item.name, value: item.id })),
      hasMore: Boolean(json.hasMore),
    };
  }

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nama Komisariat wajib diisi.");
      return;
    }
    if (!branch) {
      toast.error("Pilih Cabang terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createChapter({
        name,
        description,
        image_url: imageUrl,
        type,
        status,
        branch_id: String(branch.value),
        ...(institution ? { institution_id: Number(institution.value) } : {}),
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal membuat Komisariat.");
        return;
      }

      toast.success("Komisariat berhasil dibuat.");
      onSaved();
    } catch (err) {
      console.error("[CreateChapterFormSheet] save threw:", err);
      toast.error("Gagal membuat Komisariat.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ChapterLogoField
        imageUrl={imageUrl}
        onChange={setImageUrl}
        onUploadingChange={setIsUploadingImage}
        disabled={isSaving}
      />

      <Input
        inputId="chapter-name"
        label="Nama Komisariat"
        placeholder="Contoh: HMI Komisariat Fakultas Teknik USK"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      {lockBranch ? (
        <div className="flex flex-col gap-1">
          <label className="pl-1 text-[15px] font-medium text-[#172033]">
            Cabang
          </label>
          <p className="rounded-lg border border-[#e6e9ef] bg-[#f9fafc] px-3 py-2.5 text-sm text-[#172033]">
            {branch?.label ?? "—"}
          </p>
        </div>
      ) : (
        <SearchableSelect
          selectId="chapter-branch"
          label="Cabang"
          placeholder="Cari Cabang..."
          value={branch}
          onChange={setBranch}
          loadOptions={loadBranchOptions}
          defaultOptions={defaultBranch ? [defaultBranch] : []}
          required
        />
      )}

      <CreateableSelect
        selectId="chapter-institution"
        label="Asal Universitas"
        placeholder="Cari universitas..."
        value={institution}
        onChange={setInstitution}
        loadOptions={loadInstitutionOptions}
        defaultOptions={institution ? [institution] : []}
        onCreateOption={createInstitutionOption}
      />
      <TextArea
        textAreaId="chapter-description"
        label="Deskripsi"
        placeholder="Ceritakan sekilas tentang Komisariat ini"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={6}
      />
      <Select
        selectId="chapter-type"
        label="Tipe"
        placeholder="Pilih tipe"
        value={type}
        onChange={(value) => setType(value as BranchTypeEnum)}
        options={TYPE_OPTIONS}
        required
      />
      <Select
        selectId="chapter-status"
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
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSaving || isUploadingImage}
        >
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
