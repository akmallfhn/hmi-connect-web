"use client";

import { formatMonthYear } from "@/lib/time-manipulation";
import type { ReactNode } from "react";
import Avatar from "../common/Avatar";
import Modal from "./Modal";

interface AboutProfileModalProps {
  open: boolean;
  onClose: () => void;
  fullName?: string;
  username?: string;
  avatar?: string;
  createdAt?: string;
  registrationNumber?: number;
  provinceName?: string;
}

export default function AboutProfileModal({
  open,
  onClose,
  fullName,
  username,
  avatar,
  createdAt,
  registrationNumber,
  provinceName,
}: AboutProfileModalProps) {
  const displayName = fullName ?? "Kader";
  const nameValue = username ? `${displayName} (@${username})` : displayName;
  const joinedValue =
    [
      createdAt ? formatMonthYear(createdAt) : null,
      // The backend's own registration_number — the order this account signed up in.
      registrationNumber
        ? `#${registrationNumber.toLocaleString("id-ID")}`
        : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Belum diketahui";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tentang Profil Kamu"
      variant="bottomSheet"
      panelClassName="max-w-md"
    >
      <div className="divide-y divide-[#e6e9ef] rounded-xl border border-[#e6e9ef]">
        <Row
          label="Nama"
          value={nameValue}
          trailing={<Avatar src={avatar} name={displayName} size={48} />}
        />
        <Row label="Bergabung" value={joinedValue} />
        <Row label="Berlokasi di" value={provinceName ?? "Belum diatur"} />
      </div>
    </Modal>
  );
}

function Row({
  label,
  value,
  trailing,
}: {
  label: string;
  value: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#172033]">{label}</p>
        <p className="mt-0.5 break-words text-sm text-[#5f6573]">{value}</p>
      </div>
      {trailing}
    </div>
  );
}
