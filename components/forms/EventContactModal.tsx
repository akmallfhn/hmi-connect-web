"use client";

import { IconPhone, IconUser } from "@tabler/icons-react";
import { useState } from "react";
import type { EventContactInput } from "@/apis/events";
import { loadEventContactUserOptions } from "@/lib/event-contact-search";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import SearchableSelect, { type SearchableOption } from "../fields/SearchableSelect";
import Modal from "../modals/Modal";

export type EventContactSelection = EventContactInput & {
  displayName: string;
  displayPhone: string;
  avatar?: string;
};

export default function EventContactModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: EventContactSelection;
  onClose: () => void;
  onSave: (contact: EventContactSelection) => void;
}) {
  const [mode, setMode] = useState<"user" | "manual">(!initial || initial.user_id ? "user" : "manual");
  const [selectedUser, setSelectedUser] = useState<SearchableOption | null>(
    initial?.user_id ? { value: initial.user_id, label: initial.displayName, image: initial.avatar } : null,
  );
  const [name, setName] = useState(initial?.user_id ? "" : initial?.displayName ?? "");
  const [phone, setPhone] = useState(initial?.user_id ? "" : initial?.displayPhone ?? "");
  const [error, setError] = useState("");

  function save() {
    if (mode === "user") {
      if (!selectedUser) { setError("Pilih user dari hasil pencarian."); return; }
      onSave({
        user_id: String(selectedUser.value),
        displayName: selectedUser.label.replace(/ \(@[^)]+\)$/, ""),
        displayPhone: selectedUser.value === initial?.user_id ? initial?.displayPhone ?? "" : "",
        avatar: selectedUser.image,
      });
      return;
    }
    if (!name.trim() || !phone.trim()) { setError("Nama dan nomor WhatsApp wajib diisi."); return; }
    onSave({ name: name.trim(), phone_number: phone.trim(), displayName: name.trim(), displayPhone: phone.trim() });
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit narahubung" : "Tambah narahubung"}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Jenis narahubung">
          <Button variant={mode === "user" ? "soft" : "outline"} onClick={() => { setMode("user"); setError(""); }}>
            <IconUser className="size-4" stroke={2} /> Cari user
          </Button>
          <Button variant={mode === "manual" ? "soft" : "outline"} onClick={() => { setMode("manual"); setError(""); }}>
            <IconPhone className="size-4" stroke={2} /> Masukkan nama
          </Button>
        </div>
        {mode === "user" ? (
          <SearchableSelect
            selectId="event-contact-user"
            label="User"
            placeholder="Cari nama atau username..."
            value={selectedUser}
            onChange={(value) => { setSelectedUser(value); setError(""); }}
            loadOptions={loadEventContactUserOptions}
            defaultOptions={selectedUser ? [selectedUser] : []}
            debounceMs={300}
            showOptionAvatar
            required
          />
        ) : (
          <>
            <Input inputId="event-contact-name" label="Nama atau peran" value={name} onChange={(event) => { setName(event.target.value); setError(""); }} required />
            <Input inputId="event-contact-phone" type="tel" label="Nomor WhatsApp" value={phone} onChange={(event) => { setPhone(event.target.value); setError(""); }} required />
          </>
        )}
        {error && <p role="alert" className="text-sm text-destructive-foreground">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={save}>Simpan narahubung</Button>
        </div>
      </div>
    </Modal>
  );
}
