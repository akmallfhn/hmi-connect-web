"use client";

import { Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import type { UserProfile } from "@/apis/users";
import { updateUser } from "@/lib/actions";
import { compressImage } from "@/lib/compress-image";
import { USER_ROLE_OPTIONS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import {
  isSuccessStatus,
  type UserStatusEnum,
  type VerificationStatusEnum,
} from "@/lib/types";
import {
  isUsernameFormatValid,
  USERNAME_ERROR,
  USERNAME_PATTERN,
} from "@/lib/username";
import Button from "../buttons/Button";
import { getInitials } from "../common/Avatar";
import Input from "../fields/Input";
import Select from "../fields/Select";
import Modal from "../modals/Modal";

const AVATAR_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const AVATAR_ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];
const AVATAR_TARGET_BYTES = 300 * 1024;

const STATUS_OPTIONS: { label: string; value: UserStatusEnum }[] = [
  { label: "Pending", value: "pending" },
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

const VERIFICATION_STATUS_OPTIONS: { label: string; value: VerificationStatusEnum }[] = [
  { label: "Belum Verifikasi", value: "unverified" },
  { label: "Menunggu Review", value: "pending" },
  { label: "Terverifikasi", value: "verified" },
];

// is_alumni is a boolean on the backend; Select carries it as a string value.
const MEMBERSHIP_STATUS_OPTIONS = [
  { label: "Kader", value: "kader" },
  { label: "Alumni", value: "alumni" },
];

interface AdminEditUserAccountFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  user: UserProfile;
}

export default function AdminEditUserAccountForm({
  open,
  onClose,
  onSaved,
  user,
}: AdminEditUserAccountFormProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Akun & Peran">
      {open && <AccountFields user={user} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

// Mounted only while open, so state always seeds fresh from the fetched user — no reset effect needed.
function AccountFields({
  user,
  onClose,
  onSaved,
}: {
  user: UserProfile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [fullName, setFullName] = useState(user.full_name);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar ?? "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [roleId, setRoleId] = useState<number>(user.role_id);
  const [status, setStatus] = useState<UserStatusEnum>(user.status);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatusEnum>(
    user.verification_status,
  );
  const [isAlumni, setIsAlumni] = useState(user.is_alumni);
  const [usernameError, setUsernameError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const trimmedUsername = username.trim();
  const usernameChanged = trimmedUsername !== user.username;

  function handleAvatarPickClick() {
    avatarInputRef.current?.click();
  }

  async function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
      toast.error("Format hanya boleh JPG, PNG, WEBP, atau AVIF.");
      return;
    }
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !AVATAR_ALLOWED_EXTENSIONS.includes(fileExt)) {
      toast.error("Ekstensi file tidak valid.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const compressed = await compressImage(file, {
        maxDimension: 512,
        targetBytes: AVATAR_TARGET_BYTES,
      });
      if (compressed.size > AVATAR_TARGET_BYTES) {
        toast.error("Foto tidak dapat dikompres hingga ukuran yang diizinkan.");
        return;
      }
      const compressedExt =
        compressed.name.split(".").pop()?.toLowerCase() ?? fileExt;
      const filePath = `avatars/${user.id}-${Date.now()}.${compressedExt}`;
      const { error: uploadError } = await supabase.storage
        .from("hmi-connect")
        .upload(filePath, compressed, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("[AdminEditUserAccountForm] avatar upload error:", uploadError.message);
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

      setAvatar(publicUrlData.publicUrl);
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleSubmit() {
    if (!fullName.trim() || !email.trim()) {
      toast.error("Nama lengkap dan email wajib diisi.");
      return;
    }
    if (usernameChanged && trimmedUsername && !isUsernameFormatValid(trimmedUsername)) {
      toast.error("Username tidak valid.");
      return;
    }

    setUsernameError("");
    setIsSaving(true);
    try {
      const result = await updateUser({
        id: user.id,
        full_name: fullName,
        ...(usernameChanged ? { username: trimmedUsername } : {}),
        email,
        avatar,
        role_id: roleId,
        status,
        verification_status: verificationStatus,
        is_alumni: isAlumni,
      });

      if (!isSuccessStatus(result.status)) {
        if (result.status === "CONFLICT") {
          const message =
            "Username atau email ini sudah digunakan akun lain. Silakan pilih yang lain.";
          setUsernameError(message);
          toast.error(message);
          return;
        }
        toast.error(result.message ?? "Gagal menyimpan perubahan.");
        return;
      }

      toast.success("Akun berhasil diperbarui.");
      onSaved();
    } catch (err) {
      console.error("[AdminEditUserAccountForm] updateUser threw:", err);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        inputId="admin-account-full-name"
        label="Nama Lengkap"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <Input
        inputId="admin-account-username"
        label="Username"
        placeholder="Contoh: akmal.fhn"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        pattern={USERNAME_PATTERN}
        patternErrorMessage={USERNAME_ERROR}
        errorMessage={usernameError}
        autoCapitalize="none"
        spellCheck={false}
      />
      <Input
        inputId="admin-account-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <div className="flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-[#e6e9ef]">
          {avatar ? (
            <Image
              src={avatar}
              alt={fullName || "Foto profil"}
              width={64}
              height={64}
              className="size-full object-cover"
            />
          ) : (
            <div
              style={{ fontSize: 64 * 0.4 }}
              className="flex size-full items-center justify-center bg-primary-soft font-semibold text-primary"
            >
              {getInitials(fullName || "?")}
            </div>
          )}
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.avif"
          className="hidden"
          onChange={handleAvatarFileChange}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="light"
            size="sm"
            onClick={handleAvatarPickClick}
            disabled={isUploadingAvatar}
          >
            {isUploadingAvatar ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            {isUploadingAvatar ? "Mengunggah..." : "Unggah Foto"}
          </Button>
          {avatar && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setAvatar("")}
              disabled={isUploadingAvatar}
            >
              <Trash2 className="size-3.5" />
              Hapus
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          selectId="admin-account-role"
          label="Role"
          placeholder="Pilih role"
          value={roleId}
          onChange={(value) => setRoleId(Number(value))}
          options={USER_ROLE_OPTIONS}
          required
        />
        <Select
          selectId="admin-account-status"
          label="Status"
          placeholder="Pilih status"
          value={status}
          onChange={(value) => setStatus(value as UserStatusEnum)}
          options={STATUS_OPTIONS}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          selectId="admin-account-verification-status"
          label="Status Verifikasi"
          placeholder="Pilih status verifikasi"
          value={verificationStatus}
          onChange={(value) => setVerificationStatus(value as VerificationStatusEnum)}
          options={VERIFICATION_STATUS_OPTIONS}
          required
        />
        <Select
          selectId="admin-account-membership-status"
          label="Status Keanggotaan"
          placeholder="Pilih status keanggotaan"
          value={isAlumni ? "alumni" : "kader"}
          onChange={(value) => setIsAlumni(value === "alumni")}
          options={MEMBERSHIP_STATUS_OPTIONS}
          required
        />
      </div>

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
