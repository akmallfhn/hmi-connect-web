"use client";

import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from "emoji-picker-react";
import { ImageIcon, Send, SmilePlus, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const MAX_TEXTAREA_HEIGHT = 120;
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

function getExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function isStoragePolicyError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes("row-level security")
  );
}

async function uploadPublicStorageFile(filePath: string, file: File): Promise<string> {
  const { error } = await supabase.storage
    .from("hmi-connect")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("hmi-connect").getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error("missing public url");

  return data.publicUrl;
}

// Direct-to-storage upload, same convention as CreateFeedForms' feed_media — its own folder
// under the shared public hmi-connect bucket since chat attachments are their own resource.
// Falls back under avatars/ while storage policy is catching up, same reason feed_media does.
async function uploadChatAttachment(file: File, userId: string | undefined): Promise<string> {
  const extension = getExtension(file);
  const fileName = `${Date.now()}-${randomId()}.${extension}`;
  const primaryPath = `chat_media/${userId ?? "anonymous"}/${fileName}`;

  try {
    return await uploadPublicStorageFile(primaryPath, file);
  } catch (error) {
    if (!isStoragePolicyError(error)) throw error;

    const fallbackPath = `avatars/chat_media/${userId ?? "anonymous"}/${fileName}`;
    return uploadPublicStorageFile(fallbackPath, file);
  }
}

interface MessageComposerProps {
  userId?: string;
  onSend: (content: string, attachmentUrl?: string) => Promise<void>;
}

export default function MessageComposer({ userId, onSend }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showEmoji) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        emojiContainerRef.current &&
        !emojiContainerRef.current.contains(event.target as Node)
      ) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmoji]);

  function resizeTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }

  // Runs once on mount so the very first paint already matches one line of text height —
  // otherwise the browser's own default `rows={1}` sizing can render a hair taller than a
  // real single line, leaving the placeholder looking top-anchored instead of centered.
  useEffect(() => {
    resizeTextarea();
  }, []);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setText(event.target.value);
    resizeTextarea();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function handleEmojiClick(data: EmojiClickData) {
    setText((prev) => prev + data.emoji);
    textareaRef.current?.focus();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error("Ukuran gambar maksimal 8MB.");
      return;
    }
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  function removeImage() {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
  }

  async function handleSend() {
    const trimmed = text.trim();
    if ((!trimmed && !imageFile) || sending) return;

    setSending(true);
    try {
      let attachmentUrl: string | undefined;
      if (imageFile) {
        attachmentUrl = await uploadChatAttachment(imageFile, userId);
      }
      await onSend(trimmed, attachmentUrl);
      setText("");
      removeImage();
      setShowEmoji(false);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (error) {
      console.error("[MessageComposer] send failed:", error);
      if (isStoragePolicyError(error)) {
        toast.error(
          "Upload gambar ditolak Supabase. Izinkan folder chat_media di bucket hmi-connect."
        );
      } else {
        toast.error("Gagal mengirim pesan. Coba lagi.");
      }
    } finally {
      setSending(false);
    }
  }

  const canSend = (text.trim().length > 0 || Boolean(imageFile)) && !sending;

  return (
    <div
      className="shrink-0 border-t border-[#e6e9ef] bg-white px-3 py-3 lg:px-5"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      {imagePreviewUrl && (
        <div className="relative mb-2 inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not an optimizable remote asset */}
          <img src={imagePreviewUrl} alt="Pratinjau" className="h-24 w-24 rounded-xl object-cover" />
          <button
            type="button"
            onClick={removeImage}
            aria-label="Hapus gambar"
            className="absolute -right-2 -top-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-[#172033] text-white shadow"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-1.5">
        <div className="relative" ref={emojiContainerRef}>
          <button
            type="button"
            onClick={() => setShowEmoji((prev) => !prev)}
            aria-label="Emoji"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#5f6573] transition hover:bg-[#f5f7fb]"
          >
            <SmilePlus className="size-5" />
          </button>
          {showEmoji && (
            <div className="absolute bottom-full left-0 z-20 mb-2 overflow-hidden rounded-xl border border-[#e6e9ef] bg-white shadow-xl">
              <EmojiPicker
                open={showEmoji}
                onEmojiClick={handleEmojiClick}
                height={320}
                width={300}
                emojiStyle={EmojiStyle.NATIVE}
                theme={Theme.LIGHT}
                searchDisabled
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Kirim gambar"
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#5f6573] transition hover:bg-[#f5f7fb]"
        >
          <ImageIcon className="size-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-1 items-center rounded-3xl border border-[#dbe3ef] bg-[#f5f7fb] px-4 py-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Tulis pesan..."
            className="block max-h-[120px] w-full resize-none bg-transparent text-sm leading-6 text-[#172033] outline-none placeholder:text-[#7b8190]"
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Kirim"
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-white transition hover:bg-[#128488] active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}
