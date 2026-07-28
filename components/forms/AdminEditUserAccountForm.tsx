"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "@/apis/users";
import { updateUser } from "@/lib/actions";
import { USER_ROLE_OPTIONS } from "@/lib/constants";
import { isSuccessStatus, type UserStatusEnum } from "@/lib/types";
import {
  isUsernameFormatValid,
  USERNAME_ERROR,
  USERNAME_PATTERN,
} from "@/lib/username";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import Select from "../fields/Select";
import Switch from "../fields/Switch";
import Modal from "../modals/Modal";

const STATUS_OPTIONS: { label: string; value: UserStatusEnum }[] = [
  { label: "Pending", value: "pending" },
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
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
  const [username, setUsername] = useState(user.username ?? "");
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar ?? "");
  const [roleId, setRoleId] = useState<number>(user.role_id);
  const [status, setStatus] = useState<UserStatusEnum>(user.status);
  const [isVerified, setIsVerified] = useState(user.is_verified);
  const [usernameError, setUsernameError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const trimmedUsername = username.trim();
  const usernameChanged = trimmedUsername !== (user.username ?? "");

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
        is_verified: isVerified,
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
      <Input
        inputId="admin-account-avatar"
        label="URL Avatar"
        placeholder="https://..."
        value={avatar}
        onChange={(e) => setAvatar(e.target.value)}
      />

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

      <Switch
        switchId="admin-account-is-verified"
        label="Terverifikasi"
        checked={isVerified}
        onChange={setIsVerified}
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
