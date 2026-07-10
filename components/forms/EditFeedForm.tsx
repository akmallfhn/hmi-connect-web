"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Feed } from "@/apis/feeds";
import { updateFeed } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Modal from "../modals/Modal";

interface EditFeedFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: (feed: Feed) => void;
  feedId: string;
  initialContent: string;
}

export default function EditFeedForm({
  open,
  onClose,
  onSaved,
  feedId,
  initialContent,
}: EditFeedFormProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Postingan">
      {open && (
        <EditFeedFields
          onClose={onClose}
          onSaved={onSaved}
          feedId={feedId}
          initialContent={initialContent}
        />
      )}
    </Modal>
  );
}

interface EditFeedFieldsProps {
  onClose: () => void;
  onSaved: (feed: Feed) => void;
  feedId: string;
  initialContent: string;
}

// Mounted only while open, so content always seeds fresh from initialContent — no reset effect needed.
function EditFeedFields({
  onClose,
  onSaved,
  feedId,
  initialContent,
}: EditFeedFieldsProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error("Konten tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateFeed(feedId, trimmed);
      if (!isSuccessStatus(result.status) || !result.data) {
        toast.error(result.message ?? "Gagal menyimpan perubahan.");
        return;
      }

      toast.success("Postingan berhasil diperbarui.");
      onSaved(result.data);
    } catch (err) {
      console.error("[EditFeedForm] update feed threw:", err);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Apa yang ingin kamu bagikan?"
        rows={6}
        disabled={isSaving}
        className="max-h-72 min-h-36 w-full resize-none rounded-xl border border-[#dbe3ef] bg-white px-3 py-2.5 text-sm leading-6 text-[#172033] outline-none transition placeholder:text-[#5f6573]/70 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-[#f5f7fb]"
      />
      <div className="flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSaving || !content.trim()}
        >
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
