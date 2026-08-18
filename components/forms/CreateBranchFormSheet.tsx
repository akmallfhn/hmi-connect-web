"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createBranch } from "@/lib/actions";
import { isSuccessStatus, type BranchTypeEnum, type StatusEnum } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import Select from "../fields/Select";
import SearchableSelect, { type SearchableOption } from "../fields/SearchableSelect";
import TextArea from "../fields/TextArea";
import Sheet from "../modals/Sheet";
import BranchLogoField from "./BranchLogoField";

const TYPE_OPTIONS: { label: string; value: BranchTypeEnum }[] = [
  { label: "Penuh (Full)", value: "full" },
  { label: "Persiapan (Provisional)", value: "provisional" },
];

const STATUS_OPTIONS: { label: string; value: StatusEnum }[] = [
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

interface CreateBranchFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  defaultCoordinatingBody?: SearchableOption | null;
  // When true, the Badko field renders as fixed, read-only text instead of a searchable picker — used from a Badko's own scoped "Kelola Cabang" page so a new Cabang can't be attached to another Badko.
  lockCoordinatingBody?: boolean;
}

export default function CreateBranchFormSheet({
  open,
  onClose,
  onSaved,
  defaultCoordinatingBody = null,
  lockCoordinatingBody = false,
}: CreateBranchFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Tambah Cabang"
      description="Buat Cabang HMI baru di bawah sebuah Badko."
    >
      {open && (
        <CreateBranchFields
          defaultCoordinatingBody={defaultCoordinatingBody}
          lockCoordinatingBody={lockCoordinatingBody}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  );
}

// Mounted only while open, so state always starts fresh — no reset effect needed.
function CreateBranchFields({
  defaultCoordinatingBody,
  lockCoordinatingBody,
  onClose,
  onSaved,
}: {
  defaultCoordinatingBody: SearchableOption | null;
  lockCoordinatingBody: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [type, setType] = useState<BranchTypeEnum>("full");
  const [status, setStatus] = useState<StatusEnum>("active");
  const [coordinatingBody, setCoordinatingBody] =
    useState<SearchableOption | null>(defaultCoordinatingBody);
  const [isSaving, setIsSaving] = useState(false);

  async function loadCoordinatingBodyOptions(inputValue: string, page: number) {
    const params = new URLSearchParams({ page: String(page) });
    if (inputValue) params.set("q", inputValue);
    const response = await fetch(`/api/coordinating-bodies/search?${params}`);
    const json = await response.json();
    const results: { id: string; name: string }[] = json.data ?? [];
    return {
      options: results.map((item) => ({ label: item.name, value: item.id })),
      hasMore: Boolean(json.hasMore),
    };
  }

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nama Cabang wajib diisi.");
      return;
    }
    if (!coordinatingBody) {
      toast.error("Pilih Badko terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createBranch({
        name,
        description,
        image_url: imageUrl,
        type,
        status,
        coordinating_body_id: String(coordinatingBody.value),
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal membuat Cabang.");
        return;
      }

      toast.success("Cabang berhasil dibuat.");
      onSaved();
    } catch (err) {
      console.error("[CreateBranchFormSheet] save threw:", err);
      toast.error("Gagal membuat Cabang.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <BranchLogoField
        imageUrl={imageUrl}
        onChange={setImageUrl}
        onUploadingChange={setIsUploadingImage}
        disabled={isSaving}
      />

      <Input
        inputId="branch-name"
        label="Nama Cabang"
        placeholder="Contoh: HMI Cabang Banda Aceh"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      {lockCoordinatingBody ? (
        <div className="flex flex-col gap-1">
          <label className="pl-1 text-[15px] font-medium text-[#172033]">
            Badko
          </label>
          <p className="rounded-lg border border-[#e6e9ef] bg-[#f9fafc] px-3 py-2.5 text-sm text-[#172033]">
            {coordinatingBody?.label ?? "—"}
          </p>
        </div>
      ) : (
        <SearchableSelect
          selectId="branch-coordinating-body"
          label="Badko"
          placeholder="Cari Badko..."
          value={coordinatingBody}
          onChange={setCoordinatingBody}
          loadOptions={loadCoordinatingBodyOptions}
          defaultOptions={defaultCoordinatingBody ? [defaultCoordinatingBody] : []}
          required
        />
      )}

      <TextArea
        textAreaId="branch-description"
        label="Deskripsi"
        placeholder="Ceritakan sekilas tentang Cabang ini"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={6}
      />

      <Select
        selectId="branch-type"
        label="Tipe"
        placeholder="Pilih tipe"
        value={type}
        onChange={(value) => setType(value as BranchTypeEnum)}
        options={TYPE_OPTIONS}
        required
      />

      <Select
        selectId="branch-status"
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
