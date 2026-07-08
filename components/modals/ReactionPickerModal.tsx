"use client";

import type { ReactionTypeEnum } from "@/lib/types";
import Modal from "./Modal";

interface ReactionPickerModalProps {
  open: boolean;
  onClose: () => void;
  activeReaction: ReactionTypeEnum | null;
  onSelect: (type: ReactionTypeEnum) => void;
}

export const REACTIONS: { type: ReactionTypeEnum; emoji: string; label: string }[] = [
  { type: "like", emoji: "👍", label: "Suka" },
  { type: "love", emoji: "❤️", label: "Cinta" },
  { type: "haha", emoji: "😆", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sedih" },
  { type: "angry", emoji: "😡", label: "Marah" },
];

export default function ReactionPickerModal({
  open,
  onClose,
  activeReaction,
  onSelect,
}: ReactionPickerModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Pilih Reaksi">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {REACTIONS.map((reaction) => (
          <button
            key={reaction.type}
            type="button"
            onClick={() => {
              onSelect(reaction.type);
              onClose();
            }}
            className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition hover:scale-105 hover:bg-[#f5f7fb] ${
              activeReaction === reaction.type
                ? "border-primary bg-primary-soft"
                : "border-[#e6e9ef]"
            }`}
          >
            <span className="text-2xl">{reaction.emoji}</span>
            <span className="text-xs font-medium text-[#5f6573]">{reaction.label}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
