"use client";

import { useState } from "react";
import { toast } from "sonner";
import { addChapterToCoordinatingChapter } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import SearchableSelect, {
  type SearchableOption,
} from "../fields/SearchableSelect";
import Sheet from "../modals/Sheet";

interface AddChapterToCoordinatingChapterSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  coordinatingChapterId: string;
  branchId: string;
  branchName: string;
}

export default function AddChapterToCoordinatingChapterSheet({
  open,
  onClose,
  onSaved,
  coordinatingChapterId,
  branchId,
  branchName,
}: AddChapterToCoordinatingChapterSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Tambah Komisariat"
      description={`Pilih Komisariat yang belum tertaut ke Korkom lain di Cabang ${branchName}.`}
    >
      {open && (
        <AddChapterToCoordinatingChapterFields
          coordinatingChapterId={coordinatingChapterId}
          branchId={branchId}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  );
}

// Mounted only while open, so its selected chapter always starts fresh.
function AddChapterToCoordinatingChapterFields({
  coordinatingChapterId,
  branchId,
  onClose,
  onSaved,
}: {
  coordinatingChapterId: string;
  branchId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [chapter, setChapter] = useState<SearchableOption | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function loadChapterOptions(inputValue: string, page: number) {
    const params = new URLSearchParams({
      branch_id: branchId,
      page: String(page),
    });
    if (inputValue) params.set("q", inputValue);

    const response = await fetch(`/api/chapters/search?${params}`);
    const json = await response.json();
    const results: { id: string; name: string }[] = json.data ?? [];
    return {
      options: results.map((item) => ({ label: item.name, value: item.id })),
      hasMore: Boolean(json.hasMore),
    };
  }

  async function handleSubmit() {
    if (!chapter) {
      toast.error("Pilih Komisariat terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await addChapterToCoordinatingChapter({
        coordinating_chapter_id: coordinatingChapterId,
        chapter_id: String(chapter.value),
      });
      if (!isSuccessStatus(result.status)) {
        if (
          result.message
            ?.toLowerCase()
            .includes("already belongs to a coordinating chapter")
        ) {
          toast.error(
            "Komisariat ini sudah tertaut ke Korkom lain. Keluarkan dari Korkom tersebut terlebih dahulu.",
          );
          return;
        }

        toast.error(
          result.message ?? "Gagal menambahkan Komisariat ke Korkom.",
        );
        return;
      }

      toast.success("Komisariat berhasil ditambahkan ke Korkom.");
      onSaved();
    } catch (error) {
      console.error(
        "[AddChapterToCoordinatingChapterSheet] add chapter threw:",
        error,
      );
      toast.error("Gagal menambahkan Komisariat ke Korkom.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchableSelect
        selectId="coordinating-chapter-add-chapter"
        label="Komisariat"
        placeholder="Cari Komisariat..."
        value={chapter}
        onChange={setChapter}
        loadOptions={loadChapterOptions}
        required
      />

      <div className="mt-2 flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Menambahkan..." : "Tambah Komisariat"}
        </Button>
      </div>
    </div>
  );
}
