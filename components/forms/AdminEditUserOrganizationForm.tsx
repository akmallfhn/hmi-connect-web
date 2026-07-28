"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "@/apis/users";
import { updateUser } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import SearchableSelect, { type SearchableOption } from "../fields/SearchableSelect";
import Modal from "../modals/Modal";

interface AdminEditUserOrganizationFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  user: UserProfile;
}

export default function AdminEditUserOrganizationForm({
  open,
  onClose,
  onSaved,
  user,
}: AdminEditUserOrganizationFormProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Organisasi">
      {open && <OrganizationFields user={user} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

// Mounted only while open, so state always seeds fresh from the fetched user — no reset effect needed.
function OrganizationFields({
  user,
  onClose,
  onSaved,
}: {
  user: UserProfile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [branch, setBranch] = useState<SearchableOption | null>(
    user.branch_id && user.branch_name
      ? { label: user.branch_name, value: user.branch_id }
      : null
  );
  const [chapter, setChapter] = useState<SearchableOption | null>(
    user.chapter_id && user.chapter_name
      ? { label: user.chapter_name, value: user.chapter_id }
      : null
  );
  const [isSaving, setIsSaving] = useState(false);

  const branchDefaultOptions: SearchableOption[] =
    user.branch_id && user.branch_name
      ? [{ label: user.branch_name, value: user.branch_id }]
      : [];

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

  async function loadChapterOptions(inputValue: string, page: number) {
    if (!branch) return { options: [], hasMore: false };
    const params = new URLSearchParams({
      page: String(page),
      branch_id: String(branch.value),
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
      toast.error("Pilih komisariat terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateUser({
        id: user.id,
        chapter_id: String(chapter.value),
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan perubahan.");
        return;
      }

      toast.success("Organisasi berhasil diperbarui.");
      onSaved();
    } catch (err) {
      console.error("[AdminEditUserOrganizationForm] updateUser threw:", err);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        inputId="admin-org-member-card"
        label="Nomor Kartu Anggota"
        value={user.member_card ?? "Belum terverifikasi"}
        disabled
      />

      {user.coordinating_body_name && (
        <p className="text-xs text-[#5f6573]">
          Badko saat ini: <span className="font-medium">{user.coordinating_body_name}</span>
        </p>
      )}

      <SearchableSelect
        selectId="admin-org-branch"
        label="Cabang"
        placeholder="Cari cabang..."
        value={branch}
        onChange={(option) => {
          setBranch(option);
          setChapter(null);
        }}
        loadOptions={loadBranchOptions}
        defaultOptions={branchDefaultOptions}
        required
      />
      <SearchableSelect
        key={`admin-org-chapter-${branch?.value ?? "none"}`}
        selectId="admin-org-chapter"
        label="Komisariat"
        placeholder="Cari komisariat..."
        value={chapter}
        onChange={setChapter}
        loadOptions={loadChapterOptions}
        disabled={!branch}
        required
      />

      <div className="flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
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
