"use client";

import { useState } from "react";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import Modal from "./Modal";

interface ConfirmDeleteUserModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fullName: string;
  username: string;
  loading?: boolean;
}

// Mounted only while open so typedUsername resets fresh on every open, same pattern as Edit*Form's *Fields components.
function DeleteFields({
  fullName,
  username,
  onClose,
  onConfirm,
  loading,
}: Omit<ConfirmDeleteUserModalProps, "open">) {
  const [typedUsername, setTypedUsername] = useState("");
  const isMatch = typedUsername.trim() === username;

  return (
    <>
      <p className="text-sm text-[#5f6573] xl:text-[15px]">
        Tindakan ini menghapus permanen seluruh data {fullName}. Postingan,
        komentar, riwayat, dan lainnya tidak dapat dibatalkan. Ketik{" "}
        <span className="font-semibold text-[#172033]">{username}</span> untuk
        konfirmasi.
      </p>
      <div className="mt-4">
        <Input
          inputId="confirm-delete-username"
          placeholder={username}
          value={typedUsername}
          onChange={(e) => setTypedUsername(e.target.value)}
          disabled={loading}
          autoComplete="off"
        />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={loading || !isMatch}
        >
          {loading ? "Menghapus..." : "Hapus Permanen"}
        </Button>
      </div>
    </>
  );
}

export default function ConfirmDeleteUserModal({
  open,
  onClose,
  onConfirm,
  fullName,
  username,
  loading = false,
}: ConfirmDeleteUserModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Hapus user permanen?">
      {open && (
        <DeleteFields
          fullName={fullName}
          username={username}
          onClose={onClose}
          onConfirm={onConfirm}
          loading={loading}
        />
      )}
    </Modal>
  );
}
