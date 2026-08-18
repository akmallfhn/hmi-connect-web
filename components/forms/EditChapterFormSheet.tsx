"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ChapterDetail, ChapterListEntry } from "@/apis/chapters";
import type { Institution } from "@/apis/institutions";
import { createInstitution, getChapterDetail, updateChapter } from "@/lib/actions";
import { isSuccessStatus, type BranchTypeEnum } from "@/lib/types";
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

interface EditChapterFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  chapter: ChapterListEntry | null;
}

// Status isn't editable here — it only changes via the detail page's Suspend/Aktifkan action, same as Cabang's edit form.
export default function EditChapterFormSheet({
  open,
  onClose,
  onSaved,
  chapter,
}: EditChapterFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Edit Komisariat"
      description="Perbarui data Komisariat ini."
    >
      {open && chapter && (
        <EditChapterLoader chapter={chapter} onClose={onClose} onSaved={onSaved} />
      )}
    </Sheet>
  );
}

// The list row has no description (chapters/list doesn't return it) — fetch the real detail before mounting the fields so edit never seeds a stale/empty description.
function EditChapterLoader({
  chapter,
  onClose,
  onSaved,
}: {
  chapter: ChapterListEntry;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [detail, setDetail] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getChapterDetail(chapter.id)
      .then((result) => {
        if (cancelled) return;
        if (!result) toast.error("Gagal memuat detail Komisariat.");
        setDetail(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [chapter.id]);

  if (loading) {
    return (
      <p className="py-6 text-center text-sm text-[#5f6573]">
        Memuat data Komisariat...
      </p>
    );
  }

  return (
    <EditChapterFields
      id={chapter.id}
      initialName={detail?.name ?? chapter.name}
      initialDescription={detail?.description ?? null}
      initialImageUrl={detail?.image_url ?? chapter.image_url}
      initialType={detail?.type ?? chapter.type}
      initialBranch={{
        label: detail?.branch_name ?? chapter.branch_name,
        value: detail?.branch_id ?? chapter.branch_id,
      }}
      initialInstitution={
        (detail?.institution_id ?? chapter.institution_id)
          ? {
              label: (detail?.institution_name ?? chapter.institution_name) ?? "",
              value: (detail?.institution_id ?? chapter.institution_id)!,
              image: detail?.institution_avatar ?? chapter.institution_avatar,
            }
          : null
      }
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

// Mounted only while open, so state always seeds fresh from the row — no reset effect needed.
function EditChapterFields({
  id,
  initialName,
  initialDescription,
  initialImageUrl,
  initialType,
  initialBranch,
  initialInstitution,
  onClose,
  onSaved,
}: {
  id: string;
  initialName: string;
  initialDescription: string | null;
  initialImageUrl: string | null;
  initialType: BranchTypeEnum;
  initialBranch: SearchableOption;
  initialInstitution: CreateableOption | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [type, setType] = useState<BranchTypeEnum>(initialType);
  const [branch, setBranch] = useState<SearchableOption | null>(initialBranch);
  const [institution, setInstitution] = useState<CreateableOption | null>(
    initialInstitution
  );
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
      const result = await updateChapter({
        id,
        name,
        description,
        image_url: imageUrl,
        type,
        branch_id: String(branch.value),
        ...(institution ? { institution_id: Number(institution.value) } : {}),
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal memperbarui Komisariat.");
        return;
      }

      toast.success("Komisariat berhasil diperbarui.");
      onSaved();
    } catch (err) {
      console.error("[EditChapterFormSheet] save threw:", err);
      toast.error("Gagal memperbarui Komisariat.");
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
      <SearchableSelect
        selectId="chapter-branch"
        label="Cabang"
        placeholder="Cari Cabang..."
        value={branch}
        onChange={setBranch}
        loadOptions={loadBranchOptions}
        defaultOptions={[initialBranch]}
        required
      />
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
