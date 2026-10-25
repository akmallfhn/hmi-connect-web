"use client";

import { Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import { getInitials } from "../common/Avatar";
import Modal from "../modals/Modal";
import { deleteMedia, updateMyProfile } from "@/lib/actions";
import { uploadMediaFile } from "@/lib/media-upload";
import { optimizeImage } from "@/lib/optimize-image";
import { isSuccessStatus } from "@/lib/types";

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
      return false;
    }

    setIsSaving(true);
    try {
      const result = await updateMyProfile({ avatar: url });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan foto profil.");
        return false;
      }

      toast.success(
        url
          ? "Foto profil berhasil diperbarui."
          : "Foto profil berhasil dihapus."
      );
      onSaved();
      return true;
    } catch (err) {
      console.error("[EditAvatarForm] updateMyProfile threw:", err);
      toast.error("Gagal menyimpan foto profil.");
      return false;
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

    setIsUploading(true);
    try {
      const optimized = await optimizeImage(file, "avatar");
      const uploaded = await uploadMediaFile(optimized, "avatar");
      if (!uploaded.publicUrl) throw new Error("URL foto tidak tersedia.");
      const saved = await persistAvatar(uploaded.publicUrl);
      if (saved) {
        setAvatarUrl(uploaded.publicUrl);
      } else {
        await deleteMedia(uploaded.assetId);
      }
    } catch (error) {
      console.error("[EditAvatarForm] avatar upload threw:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal mengunggah foto.",
      );
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
      <div className="flex size-40 items-center justify-center overflow-hidden rounded-full ring-1 ring-border">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={fullName ?? "Foto profil"}
            width={160}
            height={160}
            className="size-full bg-white object-cover dark:bg-black"
          />
        ) : (
          <div
            style={{ fontSize: 160 * 0.4 }}
            className="flex size-full items-center justify-center bg-primary-soft font-semibold text-primary-foreground"
          >
            {getInitials(fullName ?? "?")}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
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
