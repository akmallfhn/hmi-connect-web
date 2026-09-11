"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { addPassword, changePassword } from "@/lib/actions";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  hasPasswordErrors,
  validateNewPassword,
  type NewPasswordErrors,
} from "@/lib/password";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import PasswordInput from "../fields/PasswordInput";
import Modal from "../modals/Modal";

interface PasswordFormProps {
  open: boolean;
  onClose: () => void;
  // check-session's has_password decides between password/add and password/change.
  hasPassword: boolean;
}

export default function PasswordForm({
  open,
  onClose,
  hasPassword,
}: PasswordFormProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={hasPassword ? "Ubah Password" : "Buat Password"}
    >
      {open && (
        <PasswordFields hasPassword={hasPassword} onClose={onClose} />
      )}
    </Modal>
  );
}

// Mounted only while the modal is open, so its state seeds fresh on every open.
function PasswordFields({
  hasPassword,
  onClose,
}: {
  hasPassword: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<NewPasswordErrors>({});
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const validation = validateNewPassword(password, confirmation);
    setErrors(validation);

    const missingOldPassword = hasPassword && !oldPassword;
    setOldPasswordError(
      missingOldPassword ? "Password saat ini wajib diisi." : ""
    );

    if (hasPasswordErrors(validation) || missingOldPassword) return;

    setSaving(true);

    try {
      const result = hasPassword
        ? await changePassword(oldPassword, password)
        : await addPassword(password);

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan password.");
        return;
      }

      toast.success(
        hasPassword ? "Password berhasil diubah." : "Password berhasil dibuat."
      );
      onClose();
      router.refresh();
    } catch (err) {
      console.error("[PasswordForm] save password threw:", err);
      toast.error("Gagal menyimpan password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm leading-6 text-[#5f6573]">
        {hasPassword
          ? `Masukkan password saat ini, lalu password baru ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} karakter.`
          : `Buat password ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} karakter agar kamu bisa masuk dengan email atau username, selain lewat Google.`}
      </p>

      {hasPassword && (
        <PasswordInput
          inputId="current-password"
          label="Password Saat Ini"
          placeholder="Masukkan password saat ini"
          autoComplete="current-password"
          value={oldPassword}
          onChange={(event) => setOldPassword(event.target.value)}
          errorMessage={oldPasswordError}
          disabled={saving}
          required
        />
      )}

      <PasswordInput
        inputId="new-password"
        label={hasPassword ? "Password Baru" : "Password"}
        placeholder={hasPassword ? "Masukkan password baru" : "Masukkan password"}
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        errorMessage={errors.password}
        disabled={saving}
        required
      />

      <PasswordInput
        inputId="new-password-confirmation"
        label="Konfirmasi Password"
        placeholder="Ulangi password"
        autoComplete="new-password"
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
        errorMessage={errors.confirmation}
        disabled={saving}
        required
      />

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={saving}
        >
          Batal
        </Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
