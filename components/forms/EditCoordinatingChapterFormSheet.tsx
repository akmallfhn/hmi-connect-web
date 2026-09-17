"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  CoordinatingChapterDetail,
  CoordinatingChapterListEntry,
} from "@/apis/coordinating-chapters";
import {
  getCoordinatingChapterDetail,
  updateCoordinatingChapter,
} from "@/lib/actions";
import { stripEntityNamePrefix } from "@/lib/feed-author";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import SearchableSelect, {
  type SearchableOption,
} from "../fields/SearchableSelect";
import TextArea from "../fields/TextArea";
import Sheet from "../modals/Sheet";
import CoordinatingChapterLogoField from "./CoordinatingChapterLogoField";

interface EditCoordinatingChapterFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  coordinatingChapter: CoordinatingChapterListEntry | null;
}

// Status isn't editable here — it only changes via the detail page's Suspend/Aktifkan action, same as Cabang/Komisariat's edit forms.
export default function EditCoordinatingChapterFormSheet({
  open,
  onClose,
  onSaved,
  coordinatingChapter,
}: EditCoordinatingChapterFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Edit Korkom"
      description="Perbarui data Korkom ini."
    >
      {open && coordinatingChapter && (
        <EditCoordinatingChapterLoader
          coordinatingChapter={coordinatingChapter}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  );
}

// The list row has no description (coordinating-chapters/list doesn't return it) — fetch the real detail before mounting the fields so edit never seeds a stale/empty description.
function EditCoordinatingChapterLoader({
  coordinatingChapter,
  onClose,
  onSaved,
}: {
  coordinatingChapter: CoordinatingChapterListEntry;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [detail, setDetail] = useState<CoordinatingChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCoordinatingChapterDetail(coordinatingChapter.id)
      .then((result) => {
        if (cancelled) return;
        if (!result) toast.error("Gagal memuat detail Korkom.");
        setDetail(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [coordinatingChapter.id]);

  if (loading) {
    return (
      <p className="py-6 text-center text-sm text-[#5f6573]">
        Memuat data Korkom...
      </p>
    );
  }

  return (
    <EditCoordinatingChapterFields
      id={coordinatingChapter.id}
      initialName={detail?.name ?? coordinatingChapter.name}
      initialLegalName={
        detail?.legal_name ?? coordinatingChapter.legal_name
      }
      initialDescription={detail?.description ?? null}
      initialImageUrl={detail?.image_url ?? coordinatingChapter.image_url}
      initialBranch={{
        label: detail?.branch_name ?? coordinatingChapter.branch_name,
        value: detail?.branch_id ?? coordinatingChapter.branch_id,
      }}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

// Mounted only while open, so state always seeds fresh from the row — no reset effect needed.
function EditCoordinatingChapterFields({
  id,
  initialName,
  initialLegalName,
  initialDescription,
  initialImageUrl,
  initialBranch,
  onClose,
  onSaved,
}: {
  id: string;
  initialName: string;
  initialLegalName: string;
  initialDescription: string | null;
  initialImageUrl: string | null;
  initialBranch: SearchableOption;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [legalName, setLegalName] = useState(initialLegalName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [branch, setBranch] = useState<SearchableOption | null>(initialBranch);
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
    const trimmedLegalName = legalName.trim();
    if (!trimmedLegalName) {
      toast.error("Nama resmi Korkom wajib diisi.");
      return;
    }
    if (!branch) {
      toast.error("Pilih Cabang terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateCoordinatingChapter({
        id,
        name: sanitizedName,
        legal_name: trimmedLegalName,
        description,
        image_url: imageUrl,
        branch_id: String(branch.value),
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal memperbarui Korkom.");
        return;
      }

      toast.success("Korkom berhasil diperbarui.");
      onSaved();
    } catch (err) {
      console.error("[EditCoordinatingChapterFormSheet] save threw:", err);
      toast.error("Gagal memperbarui Korkom.");
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
      <Input
        inputId="coordinating-chapter-legal-name"
        label="Nama Resmi"
        placeholder="Contoh: Universitas Indonesia"
        value={legalName}
        onChange={(e) => setLegalName(e.target.value)}
        required
      />
      <SearchableSelect
        selectId="coordinating-chapter-branch"
        label="Cabang"
        placeholder="Cari Cabang..."
        value={branch}
        onChange={setBranch}
        loadOptions={loadBranchOptions}
        defaultOptions={[initialBranch]}
        required
      />
      <TextArea
        textAreaId="coordinating-chapter-description"
        label="Deskripsi"
        placeholder="Ceritakan sekilas tentang Korkom ini"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={6}
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
