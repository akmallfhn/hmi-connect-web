"use client";

import { useEffect, useState } from "react";
import {
  isMentionNameFormatValid,
  MENTION_NAME_ERROR,
  normalizeMentionName,
} from "@/lib/mentions";
import { isSuccessStatus, type MentionEntityTypeEnum, type StatusName } from "@/lib/types";

export type MentionNameStatus =
  | "idle"
  | "invalid"
  | "current"
  | "checking"
  | "available"
  | "unavailable"
  | "error";

export type MentionNameField = {
  value: string;
  mentionName: string;
  status: MentionNameStatus;
  setValue: (value: string) => void;
};

const CHECK_DEBOUNCE_MS = 400;

// Debounces an availability check against every user and entity handle; the entity's own handle reads as current.
export function useMentionNameField(options: {
  initial?: string;
  entityType: MentionEntityTypeEnum;
  entityId?: string;
}): MentionNameField {
  const { initial = "", entityType, entityId } = options;
  const initialKey = normalizeMentionName(initial).toLowerCase();
  const [value, setValueState] = useState(initial);
  const [status, setStatus] = useState<MentionNameStatus>(() =>
    statusFor(initial, initialKey),
  );
  const mentionName = normalizeMentionName(value);

  useEffect(() => {
    if (status !== "checking") return;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/entity-mentions/check-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mention_name: mentionName,
            entity_type: entityId ? entityType : undefined,
            entity_id: entityId,
          }),
          signal: controller.signal,
        });
        const result = (await response.json()) as {
          status?: StatusName;
          data?: { is_available?: boolean };
        };
        if (
          !response.ok ||
          !isSuccessStatus(result.status) ||
          typeof result.data?.is_available !== "boolean"
        ) {
          setStatus("error");
          return;
        }
        setStatus(result.data.is_available ? "available" : "unavailable");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("[useMentionNameField] availability check threw:", err);
        setStatus("error");
      }
    }, CHECK_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [mentionName, status, entityType, entityId]);

  return {
    value,
    mentionName,
    status,
    setValue: (next) => {
      setValueState(next);
      setStatus(statusFor(next, initialKey));
    },
  };
}

function statusFor(value: string, initialKey: string): MentionNameStatus {
  const normalized = normalizeMentionName(value);
  if (!normalized) return "idle";
  if (!isMentionNameFormatValid(normalized)) return "invalid";
  if (initialKey && normalized.toLowerCase() === initialKey) return "current";
  return "checking";
}

// A failed check still submits; the backend's own 409 is the final word on a collision.
export function mentionNameSubmitError(status: MentionNameStatus): string | null {
  switch (status) {
    case "idle":
      return "Official Account ID wajib diisi.";
    case "invalid":
      return MENTION_NAME_ERROR;
    case "checking":
      return "Official Account ID masih diperiksa. Coba lagi sebentar.";
    case "unavailable":
      return "Official Account ID sudah dipakai. Pilih yang lain.";
    default:
      return null;
  }
}
