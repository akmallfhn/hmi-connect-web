"use client";

import { useState } from "react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import TextArea from "../fields/TextArea";
import Modal from "../common/Modal";
import { updateUser } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";

interface EditHeaderFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  fullName?: string;
  headline?: string;
  bio?: string;
  avatar?: string;
}

export default function EditHeaderForm({
  open,
  onClose,
  onSaved,
  userId,
  fullName,
  headline,
  bio,
  avatar,
}: EditHeaderFormProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Informasi Dasar">
      {open && (
        <HeaderFields
          onClose={onClose}
          onSaved={onSaved}
          userId={userId}
          fullName={fullName}
          headline={headline}
          bio={bio}
          avatar={avatar}
        />
      )}
    </Modal>
  );
}

interface HeaderFieldsProps {
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  fullName?: string;
  headline?: string;
  bio?: string;
  avatar?: string;
}

// Mounted only while the modal is open, so its initial state is always seeded fresh
// from the latest props — no effect needed to "reset" it on reopen.
function HeaderFields({
  onClose,
  onSaved,
  userId,
  fullName,
  headline,
  bio,
  avatar,
}: HeaderFieldsProps) {
  const [form, setForm] = useState({
    fullName: fullName ?? "",
    headline: headline ?? "",
    bio: bio ?? "",
    avatar: avatar ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    if (!userId) {
      toast.error("ID pengguna tidak ditemukan.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateUser({
        id: userId,
        full_name: form.fullName,
        headline: form.headline,
        bio: form.bio,
        avatar: form.avatar,
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan perubahan.");
        return;
      }

      toast.success("Informasi dasar berhasil diperbarui.");
      onSaved();
    } catch (err) {
      console.error("[EditHeaderForm] updateUser threw:", err);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        inputId="edit-full-name"
        label="Nama Lengkap"
        value={form.fullName}
        onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
      />
      <Input
        inputId="edit-headline"
        label="Headline"
        placeholder="Contoh: Ketua Bidang"
        value={form.headline}
        onChange={(e) => setForm((prev) => ({ ...prev, headline: e.target.value }))}
      />
      <TextArea
        textAreaId="edit-bio"
        label="Bio"
        placeholder="Ceritakan sedikit tentang dirimu"
        value={form.bio}
        onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
        rows={4}
        characterLength={280}
      />
      <Input
        inputId="edit-avatar"
        label="URL Foto Profil"
        placeholder="https://..."
        value={form.avatar}
        onChange={(e) => setForm((prev) => ({ ...prev, avatar: e.target.value }))}
      />

      <div className="mt-2 flex justify-end gap-3">
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
