"use client";

import { useEffect, useRef } from "react";
import type { ReactionTypeEnum } from "@/lib/types";

interface ReactionPickerModalProps {
  open: boolean;
  onClose: () => void;
  activeReaction: ReactionTypeEnum | null;
  onSelect: (type: ReactionTypeEnum) => void;
}

export const REACTIONS: { type: ReactionTypeEnum; emoji: string; label: string }[] = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "haha", emoji: "😆", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😡", label: "Angry" },
];

export default function ReactionPickerModal({
  open,
  onClose,
  activeReaction,
  onSelect,
}: ReactionPickerModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

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

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute bottom-full left-0 z-50 mb-2 flex gap-1 rounded-2xl border border-[#e6e9ef] bg-white p-1.5 shadow-lg"
    >
      {REACTIONS.map((reaction) => (
        <button
          key={reaction.type}
          type="button"
          onClick={() => {
            onSelect(reaction.type);
            onClose();
          }}
          className={`flex cursor-pointer flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition hover:-translate-y-0.5 hover:bg-[#f5f7fb] ${
            activeReaction === reaction.type ? "bg-primary-soft" : ""
          }`}
        >
          <span className="text-xl leading-none">{reaction.emoji}</span>
          <span className="whitespace-nowrap text-[10px] font-medium text-[#5f6573]">
            {reaction.label}
          </span>
        </button>
      ))}
    </div>
  );
}
