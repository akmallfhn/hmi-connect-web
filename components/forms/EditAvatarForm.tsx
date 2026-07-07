"use client";

import { Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import { getInitials } from "../common/Avatar";
import Modal from "../modals/Modal";
import { updateUser } from "@/lib/actions";
import { supabase } from "@/lib/supabase";
import { isSuccessStatus } from "@/lib/types";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];
const MAX_FILE_BYTES = 2 * 1024 * 1024;

interface EditAvatarFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  fullName?: string;
  avatar?: string;
}

export default function EditAvatarForm({
  open,
  onClose,
  onSaved,
  userId,
  fullName,
  avatar,
}: EditAvatarFormProps) {
  return (
    <Modal open={open} onClose={onClose} title="Foto Profil">
      {open && (
        <AvatarFields
          onClose={onClose}
          onSaved={onSaved}
          userId={userId}
          fullName={fullName}
          avatar={avatar}
        />
      )}
    </Modal>
  );
}

interface AvatarFieldsProps {
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  fullName?: string;
  avatar?: string;
}

// Mounted only while open, so state always seeds fresh from props — no reset effect needed.
function AvatarFields({
  onClose,
  onSaved,
  userId,
  fullName,
  avatar,
}: AvatarFieldsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(avatar ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isBusy = isUploading || isSaving;

  async function persistAvatar(url: string) {
    if (!userId) {
      toast.error("ID pengguna tidak ditemukan.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateUser({ id: userId, avatar: url });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan foto profil.");
        return;
      }

      toast.success(
        url
          ? "Foto profil berhasil diperbarui."
          : "Foto profil berhasil dihapus."
      );
      onSaved();
    } catch (err) {
      console.error("[EditAvatarForm] updateUser threw:", err);
      toast.error("Gagal menyimpan foto profil.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleChangeClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      toast.error("Ukuran foto maksimal 2MB.");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Format hanya boleh JPG, PNG, WEBP, atau AVIF.");
      return;
    }
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      toast.error("Ekstensi file tidak valid.");
      return;
    }

    const filePath = `avatars/${userId}-${Date.now()}.${fileExt}`;

    setIsUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from("hmi-connect")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("[EditAvatarForm] upload error:", uploadError.message);
        toast.error("Gagal mengunggah foto. Coba lagi.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("hmi-connect")
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        toast.error("Gagal mendapatkan URL foto.");
        return;
      }

      setAvatarUrl(publicUrlData.publicUrl);
      await persistAvatar(publicUrlData.publicUrl);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove() {
    setAvatarUrl("");
    await persistAvatar("");
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex size-40 items-center justify-center overflow-hidden rounded-full ring-1 ring-[#e6e9ef]">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={fullName ?? "Foto profil"}
            width={160}
            height={160}
            className="size-full object-cover"
          />
        ) : (
          <div
            style={{ fontSize: 160 * 0.4 }}
            className="flex size-full items-center justify-center bg-primary-soft font-semibold text-primary"
          >
            {getInitials(fullName ?? "?")}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.avif"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        <Button variant="light" onClick={handleChangeClick} disabled={isBusy}>
          {isUploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Upload className="size-3.5" />
          )}
          {isUploading ? "Mengunggah..." : "Ganti Foto"}
        </Button>
        {avatarUrl && (
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={isBusy}
          >
            <Trash2 className="size-3.5" />
            Hapus Foto
          </Button>
        )}
      </div>

      <div className="mt-1 flex w-full justify-end">
        <Button variant="outline" onClick={onClose} disabled={isBusy}>
          Tutup
        </Button>
      </div>
    </div>
  );
}
