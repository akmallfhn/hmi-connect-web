"use client";

import { Send } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useRef } from "react";
import Avatar from "../common/Avatar";
import Button from "../buttons/Button";

interface CommentSubmitterProps {
  avatar?: string;
  name?: string;
  avatarSize?: number;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CommentSubmitter({
  avatar,
  name,
  avatarSize = 32,
  value,
  onChange,
  onSubmit,
  placeholder = "Tulis komentar...",
  disabled = false,
}: CommentSubmitterProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2">
      <Avatar src={avatar} name={name ?? "Kader"} size={avatarSize} />
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className="max-h-40 flex-1 resize-none rounded-2xl border border-[#e6e9ef] bg-[#f5f7fb] px-4 py-2 text-sm leading-5 outline-none focus:border-primary [&::-webkit-scrollbar]:hidden"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        disabled={disabled || !value.trim()}
        className="shrink-0 rounded-full text-primary hover:bg-primary-soft"
        aria-label="Kirim"
      >
        <Send className="size-4" />
      </Button>
    </form>
  );
}
