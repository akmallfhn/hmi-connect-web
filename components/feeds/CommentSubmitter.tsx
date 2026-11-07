"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import Avatar from "../common/Avatar";
import FeedAuthorAvatar from "./FeedAuthorAvatar";
import SpecialBodyLogoFallback from "../svg/SpecialBodyLogoFallback";
import type { ComposerAuthorEntity } from "../forms/CreateFeedForms";
import Button from "../buttons/Button";
import MentionTextarea from "../fields/MentionTextarea";

interface CommentSubmitterProps {
  avatar?: string;
  name?: string;
  authorEntity?: ComposerAuthorEntity;
  avatarSize?: number;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel?: () => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

const LINE_HEIGHT = 24;

// Substack-style reply card: actions only appear once the field is in use.
export default function CommentSubmitter({
  avatar,
  name,
  authorEntity,
  avatarSize = 32,
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder = "Tulis komentar...",
  disabled = false,
  autoFocus = false,
}: CommentSubmitterProps) {
  const [focused, setFocused] = useState(autoFocus);
  const expanded = focused || value.length > 0 || Boolean(onCancel);
  const verticalPadding = Math.max(0, (avatarSize - LINE_HEIGHT) / 2);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    } else if (event.key === "Escape" && onCancel) {
      onCancel();
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-border-strong bg-surface px-3 py-2.5 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 sm:px-4 sm:py-3"
    >
      <div className="flex items-start gap-3">
        {authorEntity ? (
          <FeedAuthorAvatar
            author={{
              name: authorEntity.name,
              avatar: authorEntity.imageUrl ?? undefined,
              href: authorEntity.profileHref ?? "#",
              isEntity: true,
            }}
            size={avatarSize}
            fallbackLogo={
              authorEntity.type === "special_body" && authorEntity.bodyType ? (
                <SpecialBodyLogoFallback
                  type={authorEntity.bodyType}
                  style={{ width: avatarSize * 0.5, height: avatarSize * 0.5 }}
                />
              ) : undefined
            }
          />
        ) : (
          <Avatar src={avatar} name={name ?? "Kader"} size={avatarSize} />
        )}
        <MentionTextarea
          rows={1}
          value={value}
          onValueChange={onChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoFocus={autoFocus}
          autoResizeMaxHeight={192}
          containerClassName="min-w-0 flex-1"
          placeholder={placeholder}
          aria-label={placeholder}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingTop: verticalPadding,
            paddingBottom: verticalPadding,
          }}
          className="max-h-48 w-full resize-none bg-transparent text-[15px] leading-6 text-heading outline-none placeholder:text-placeholder [&::-webkit-scrollbar]:hidden"
        />
      </div>
      {expanded && (
        <div className="mt-2 flex items-center justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={disabled}
            >
              Batal
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            // Keep focus on the field so the blur doesn't collapse the row before the click lands.
            onMouseDown={(event) => event.preventDefault()}
            disabled={disabled || !value.trim()}
          >
            {disabled ? "Mengirim..." : "Kirim"}
          </Button>
        </div>
      )}
    </form>
  );
}
