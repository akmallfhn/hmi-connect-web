"use client";

import { useState } from "react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import TextArea from "../fields/TextArea";
import Modal from "../modals/Modal";
import { updateUser } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";

interface EditProfileFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  fullName?: string;
  headline?: string;
  bio?: string;
  avatar?: string;
}

export default function EditProfileForm({
  open,
  onClose,
  onSaved,
  userId,
  fullName,
  headline,
  bio,
  avatar,
}: EditProfileFormProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Informasi Dasar">
      {open && (
        <ProfileFields
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

interface ProfileFieldsProps {
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  fullName?: string;
  headline?: string;
  bio?: string;
  avatar?: string;
}

// Mounted only while open, so state always seeds fresh from props — no reset effect needed.
function ProfileFields({
  onClose,
  onSaved,
  userId,
  fullName,
  headline,
  bio,
  avatar,
}: ProfileFieldsProps) {
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
      console.error("[EditProfileForm] updateUser threw:", err);
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
        placeholder="Nama lengkap kamu"
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
