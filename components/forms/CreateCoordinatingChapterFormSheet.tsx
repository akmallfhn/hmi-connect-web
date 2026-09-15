"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createCoordinatingChapter } from "@/lib/actions";
import { stripEntityNamePrefix } from "@/lib/feed-author";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import SearchableSelect, {
  type SearchableOption,
} from "../fields/SearchableSelect";
import Sheet from "../modals/Sheet";
import CoordinatingChapterLogoField from "./CoordinatingChapterLogoField";

interface CreateCoordinatingChapterFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  defaultBranch?: SearchableOption | null;
  // When true, the Cabang field renders as fixed, read-only text instead of a searchable picker — used from a Cabang's own scoped "Kelola Korkom" page so a new Korkom can't be attached to another Cabang.
  lockBranch?: boolean;
}

export default function CreateCoordinatingChapterFormSheet({
  open,
  onClose,
  onSaved,
  defaultBranch = null,
  lockBranch = false,
}: CreateCoordinatingChapterFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Tambah Korkom"
      description="Buat Korkom (Koordinator Komisariat) baru di bawah sebuah Cabang."
    >
      {open && (
        <CreateCoordinatingChapterFields
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
function CreateCoordinatingChapterFields({
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
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [branch, setBranch] = useState<SearchableOption | null>(defaultBranch);
  const [isSaving, setIsSaving] = useState(false);

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
    const sanitizedName = stripEntityNamePrefix("coordinating_chapter", name);
    if (!sanitizedName) {
      toast.error("Nama Korkom wajib diisi.");
      return;
    }
    if (!branch) {
      toast.error("Pilih Cabang terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createCoordinatingChapter({
        name: sanitizedName,
        image_url: imageUrl,
        status: "active",
        branch_id: String(branch.value),
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal membuat Korkom.");
        return;
      }

      toast.success("Korkom berhasil dibuat.");
      onSaved();
    } catch (err) {
      console.error("[CreateCoordinatingChapterFormSheet] save threw:", err);
      toast.error("Gagal membuat Korkom.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <CoordinatingChapterLogoField
        imageUrl={imageUrl}
        onChange={setImageUrl}
        onUploadingChange={setIsUploadingImage}
        disabled={isSaving}
      />

      <Input
        inputId="coordinating-chapter-name"
        label="Nama Korkom"
        placeholder="Contoh: UI"
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
          selectId="coordinating-chapter-branch"
          label="Cabang"
          placeholder="Cari Cabang..."
          value={branch}
          onChange={setBranch}
          loadOptions={loadBranchOptions}
          defaultOptions={defaultBranch ? [defaultBranch] : []}
          required
        />
      )}

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
