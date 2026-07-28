"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { UserListEntry } from "@/apis/users";
import { USER_ROLE_OPTIONS } from "@/lib/constants";
import { updateUser } from "@/lib/actions";
import { isSuccessStatus, type UserStatusEnum } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import Select from "../fields/Select";
import SearchableSelect, { type SearchableOption } from "../fields/SearchableSelect";
import Modal from "../modals/Modal";

const STATUS_OPTIONS: { label: string; value: UserStatusEnum }[] = [
  { label: "Pending", value: "pending" },
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

interface AdminUserQuickEditFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  user: UserListEntry | null;
}

// Quick edit straight from the user list row — only fields UserListEntry already has; deeper fields need the full detail page.
export default function AdminUserQuickEditForm({
  open,
  onClose,
  onSaved,
  user,
}: AdminUserQuickEditFormProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Cepat Pengguna">
      {open && user && (
        <QuickEditFields user={user} onClose={onClose} onSaved={onSaved} />
      )}
    </Modal>
  );
}

interface QuickEditFieldsProps {
  user: UserListEntry;
  onClose: () => void;
  onSaved: () => void;
}

// Mounted only while open, so state always seeds fresh from the row — no reset effect needed.
function QuickEditFields({ user, onClose, onSaved }: QuickEditFieldsProps) {
  const [fullName, setFullName] = useState(user.full_name);
  const [roleId, setRoleId] = useState<number>(user.role_id);
  const [status, setStatus] = useState<UserStatusEnum>(user.status);
  const [isVerified, setIsVerified] = useState(user.is_verified);
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
    if (!fullName.trim()) {
      toast.error("Nama lengkap wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateUser({
        id: user.id,
        full_name: fullName,
        role_id: roleId,
        status,
        is_verified: isVerified,
        ...(chapter ? { chapter_id: String(chapter.value) } : {}),
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan perubahan.");
        return;
      }

      toast.success("Pengguna berhasil diperbarui.");
      onSaved();
    } catch (err) {
      console.error("[AdminUserQuickEditForm] updateUser threw:", err);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        inputId="quick-edit-full-name"
        label="Nama Lengkap"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />

      <SearchableSelect
        selectId="quick-edit-branch"
        label="Cabang"
        placeholder="Cari cabang..."
        value={branch}
        onChange={(option) => {
          setBranch(option);
          setChapter(null);
        }}
        loadOptions={loadBranchOptions}
      />
      <SearchableSelect
        key={`quick-edit-chapter-${branch?.value ?? "none"}`}
        selectId="quick-edit-chapter"
        label="Komisariat"
        placeholder="Cari komisariat..."
        value={chapter}
        onChange={setChapter}
        loadOptions={loadChapterOptions}
        disabled={!branch}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          selectId="quick-edit-role"
          label="Role"
          placeholder="Pilih role"
          value={roleId}
          onChange={(value) => setRoleId(Number(value))}
          options={USER_ROLE_OPTIONS}
          required
        />
        <Select
          selectId="quick-edit-status"
          label="Status"
          placeholder="Pilih status"
          value={status}
          onChange={(value) => setStatus(value as UserStatusEnum)}
          options={STATUS_OPTIONS}
          required
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 pl-1 text-sm font-medium text-[#172033]">
        <input
          type="checkbox"
          checked={isVerified}
          onChange={(e) => setIsVerified(e.target.checked)}
          className="size-4 accent-primary"
        />
        Terverifikasi (KTP)
      </label>

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
