"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { BranchListEntry } from "@/apis/branches";
import { createBranch, updateBranch } from "@/lib/actions";
import { isSuccessStatus, type BranchTypeEnum, type StatusEnum } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import Select from "../fields/Select";
import SearchableSelect, { type SearchableOption } from "../fields/SearchableSelect";
import Sheet from "../modals/Sheet";

const TYPE_OPTIONS: { label: string; value: BranchTypeEnum }[] = [
  { label: "Penuh (Full)", value: "full" },
  { label: "Persiapan (Provisional)", value: "provisional" },
];

const STATUS_OPTIONS: { label: string; value: StatusEnum }[] = [
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

interface BranchFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  branch: BranchListEntry | null;
}

export default function BranchFormSheet({
  open,
  onClose,
  onSaved,
  branch,
}: BranchFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={branch ? "Edit Cabang" : "Tambah Cabang"}
      description={
        branch
          ? "Perbarui data cabang ini."
          : "Buat cabang (Cabang HMI) baru di bawah sebuah Badko."
      }
    >
      {open && <BranchFields branch={branch} onClose={onClose} onSaved={onSaved} />}
    </Sheet>
  );
}

// Mounted only while open, so state always seeds fresh from the row — no reset effect needed.
function BranchFields({
  branch,
  onClose,
  onSaved,
}: {
  branch: BranchListEntry | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(branch?.name ?? "");
  const [type, setType] = useState<BranchTypeEnum>(branch?.type ?? "full");
  const [status, setStatus] = useState<StatusEnum>(branch?.status ?? "active");
  const [coordinatingBody, setCoordinatingBody] = useState<SearchableOption | null>(
    branch?.coordinating_body_id && branch.coordinating_body_name
      ? { label: branch.coordinating_body_name, value: branch.coordinating_body_id }
      : null
  );
  const [isSaving, setIsSaving] = useState(false);

  const coordinatingBodyDefaultOptions: SearchableOption[] =
    branch?.coordinating_body_id && branch.coordinating_body_name
      ? [{ label: branch.coordinating_body_name, value: branch.coordinating_body_id }]
      : [];

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
      toast.error("Nama cabang wajib diisi.");
      return;
    }
    if (!coordinatingBody) {
      toast.error("Pilih Badko terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    try {
      const result = branch
        ? await updateBranch({
            id: branch.id,
            name,
            type,
            status,
            coordinating_body_id: String(coordinatingBody.value),
          })
        : await createBranch({
            name,
            type,
            status,
            coordinating_body_id: String(coordinatingBody.value),
          });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan cabang.");
        return;
      }

      toast.success(branch ? "Cabang berhasil diperbarui." : "Cabang berhasil dibuat.");
      onSaved();
    } catch (err) {
      console.error("[BranchFormSheet] save threw:", err);
      toast.error("Gagal menyimpan cabang.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        inputId="branch-name"
        label="Nama Cabang"
        placeholder="Contoh: HMI Cabang Banda Aceh"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <SearchableSelect
        selectId="branch-coordinating-body"
        label="Badko"
        placeholder="Cari Badko..."
        value={coordinatingBody}
        onChange={setCoordinatingBody}
        loadOptions={loadCoordinatingBodyOptions}
        defaultOptions={coordinatingBodyDefaultOptions}
        required
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
        <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
