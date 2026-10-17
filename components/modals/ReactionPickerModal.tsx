"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import type { ReactionTypeEnum } from "@/lib/types";

interface ReactionPickerModalProps {
  open: boolean;
  onClose: () => void;
  activeReaction: ReactionTypeEnum | null;
  onSelect: (type: ReactionTypeEnum) => void;
  anchorRef: RefObject<HTMLButtonElement | null>;
}

export const REACTIONS: { type: ReactionTypeEnum; emoji: string; label: string }[] = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "haha", emoji: "😆", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😡", label: "Angry" },
];

const DESKTOP_QUERY = "(min-width: 1024px)";

export default function ReactionPickerModal({
  open,
  onClose,
  activeReaction,
  onSelect,
  anchorRef,
}: ReactionPickerModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Position the portal beside its trigger without clipping inside scroll containers.
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  // Close the picker if the trigger scrolls away.
  useEffect(() => {
    if (!open) return;

    function handleScroll() {
      onClose();
    }

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () =>
      window.removeEventListener("scroll", handleScroll, { capture: true });
  }, [open, onClose]);

  useLayoutEffect(() => {
    if (!open) return;

    function measure() {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;
      const anchorRect = anchor.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const desktop = window.matchMedia(DESKTOP_QUERY).matches;
      const desiredLeft = desktop
        ? anchorRect.left
        : (window.innerWidth - panelRect.width) / 2;
      const left = Math.min(
        Math.max(8, desiredLeft),
        Math.max(8, window.innerWidth - panelRect.width - 8),
      );
      const topAbove = anchorRect.top - panelRect.height - 8;
      const top = topAbove >= 8 ? topAbove : anchorRect.bottom + 8;
      setPosition({ top, left });
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [anchorRef, open]);

  if (!open) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Pilih reaksi"
      style={position ?? { visibility: "hidden" }}
      className="fixed z-[120] flex gap-1 rounded-2xl border border-border bg-surface p-1.5 shadow-lg"
    >
      {REACTIONS.map((reaction) => (
        <button
          key={reaction.type}
          type="button"
          onClick={() => {
            onSelect(reaction.type);
            onClose();
          }}
          className={`flex cursor-pointer flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition hover:-translate-y-0.5 hover:bg-surface-muted ${
            activeReaction === reaction.type ? "bg-primary-soft" : ""
          }`}
        >
          <span className="text-xl leading-none">{reaction.emoji}</span>
          <span className="whitespace-nowrap text-[10px] font-medium text-muted-foreground">
            {reaction.label}
          </span>
        </button>
      ))}
    </div>,
    document.body,
  );
}
