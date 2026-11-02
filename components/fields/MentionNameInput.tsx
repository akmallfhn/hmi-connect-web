"use client";

import { CircleCheck, CircleX, Loader2 } from "lucide-react";
import type { MentionNameField } from "@/hooks/useMentionNameField";
import { MENTION_NAME_ERROR } from "@/lib/mentions";
import Input from "./Input";

interface MentionNameInputProps {
  inputId: string;
  field: MentionNameField;
  placeholder?: string;
  disabled?: boolean;
}

const STATUS_MESSAGE: Partial<
  Record<MentionNameField["status"], { text: string; className: string }>
> = {
  invalid: { text: MENTION_NAME_ERROR, className: "text-destructive-foreground" },
  checking: { text: "Memeriksa ketersediaan...", className: "text-muted-foreground" },
  available: { text: "Official Account ID tersedia.", className: "font-medium text-primary-foreground" },
  unavailable: {
    text: "Sudah dipakai akun lain. Pilih Official Account ID lain.",
    className: "text-destructive-foreground",
  },
  error: { text: "Ketersediaan gagal diperiksa. Coba lagi.", className: "text-destructive-foreground" },
};

export default function MentionNameInput({
  inputId,
  field,
  placeholder,
  disabled,
}: MentionNameInputProps) {
  const { status, mentionName } = field;
  const message = STATUS_MESSAGE[status];
  const showPreview = status !== "idle" && status !== "invalid";

  return (
    <div className="flex flex-col gap-1">
      <Input
        inputId={inputId}
        label="Official Account ID"
        placeholder={placeholder}
        value={field.value}
        onChange={(event) => field.setValue(event.target.value)}
        trailing={<StatusIcon status={status} />}
        autoCapitalize="none"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        required
      />
      {showPreview && (
        <p className="pl-1 text-xs text-muted-foreground">
          Tampil sebagai{" "}
          <span className="font-medium text-primary">@{mentionName}</span>
        </p>
      )}
      {message && <p className={`pl-1 text-xs ${message.className}`}>{message.text}</p>}
    </div>
  );
}

function StatusIcon({ status }: { status: MentionNameField["status"] }) {
  if (status === "checking") {
    return <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />;
  }
  if (status === "available" || status === "current") {
    return <CircleCheck className="size-4 text-primary-foreground" aria-hidden />;
  }
  if (status === "unavailable" || status === "invalid") {
    return <CircleX className="size-4 text-destructive-foreground" aria-hidden />;
  }
  return null;
}
