"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

const DESKTOP_QUERY = "(min-width: 1024px)";

export default function ReactionPickerModal({
  open,
  onClose,
  activeReaction,
  onSelect,
}: ReactionPickerModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // On mobile the picker is `fixed` and dead-centered horizontally (never anchored to the
  // trigger's x — trigger position varies too much between feed/comment/reply to keep it
  // on-screen otherwise), only its `bottom` offset is computed to float above the trigger.
  // On desktop (>= lg) it's a plain `absolute bottom-full left-0` next to the trigger, no
  // JS needed — there's always enough room.
  const [mobileBottom, setMobileBottom] = useState<number | null>(null);

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

  // On mobile the picker is `fixed`, so it doesn't scroll with its trigger — close it on
  // scroll instead of leaving it floating over unrelated content. `capture: true` catches
  // scrolling on the feed's own scroll container too, not just window/document.
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
      if (window.matchMedia(DESKTOP_QUERY).matches) {
        setMobileBottom(null);
        return;
      }
      const parent = panelRef.current?.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      setMobileBottom(window.innerHeight - rect.top + 8);
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      style={mobileBottom !== null ? { bottom: mobileBottom } : undefined}
      className={[
        "z-50 flex gap-1 rounded-2xl border border-[#e6e9ef] bg-white p-1.5 shadow-lg",
        mobileBottom !== null
          ? "fixed left-1/2 -translate-x-1/2"
          : "absolute bottom-full left-0 mb-2",
        "lg:absolute lg:bottom-full lg:left-0 lg:mb-2 lg:translate-x-0",
      ].join(" ")}
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
