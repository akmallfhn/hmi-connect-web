"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createOrganizationalDocument } from "@/lib/actions";
import Switch from "../buttons/Switch";
import Input from "../fields/Input";
import Sheet from "../modals/Sheet";
import {
  DocumentCoverField,
  DocumentPdfField,
  SheetFooter,
  toPublishedAt,
  type UploadedCover,
  type UploadedPdf,
} from "./OrganizationalDocumentFields";

interface CreateOrganizationalDocumentFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  organizationId: string;
  defaultPublishedDate: string;
}

export default function CreateOrganizationalDocumentFormSheet({
  open,
  onClose,
  onSaved,
  organizationId,
  defaultPublishedDate,
}: CreateOrganizationalDocumentFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Tambah Pedoman"
      description="Unggah PDF pedoman, lalu lengkapi informasinya."
    >
      {open && (
        <CreateDocumentFields
          onClose={onClose}
          onSaved={onSaved}
          organizationId={organizationId}
          defaultPublishedDate={defaultPublishedDate}
        />
      )}
    </Sheet>
  );
}

// Metadata only; the table of contents is filled in later from the row's "Atur Daftar Isi" action.
function CreateDocumentFields({
  onClose,
  onSaved,
  organizationId,
  defaultPublishedDate,
}: Omit<CreateOrganizationalDocumentFormSheetProps, "open">) {
  const [title, setTitle] = useState("");
  const [pdf, setPdf] = useState<UploadedPdf | null>(null);
  const [cover, setCover] = useState<UploadedCover | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [publishedDate, setPublishedDate] = useState(defaultPublishedDate);
  const [isActive, setIsActive] = useState(true);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const busy = uploadingPdf || uploadingCover || saving;

  async function handleSave() {
    setShowErrors(true);
    if (!title.trim()) {
      toast.error("Judul pedoman wajib diisi.");
      return;
    }
    if (!pdf) {
      toast.error("Unggah file PDF pedoman terlebih dahulu.");
      return;
    }
    if (!publishedDate) {
      toast.error("Tanggal terbit wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const result = await createOrganizationalDocument({
        organization_id: organizationId,
        title: title.trim(),
        file_media_id: pdf.mediaId,
        ...(cover ? { image_media_id: cover.mediaId } : {}),
        ...(pageCount ? { page_count: pageCount } : {}),
        status: isActive ? "active" : "inactive",
        published_at: toPublishedAt(publishedDate),
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Pedoman berhasil ditambahkan.");
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Input
        inputId="document-title"
        label="Judul"
        required
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Contoh: PDK MUNAS KOHATI XXIII Ambon"
        errorMessage={
          showErrors && !title.trim() ? "Judul pedoman wajib diisi." : undefined
        }
      />

      <DocumentPdfField
        pdf={pdf}
        pageCount={pageCount}
        invalid={showErrors && !pdf}
        disabled={busy}
        onBusyChange={setUploadingPdf}
        onUploaded={(upload) => {
          setPdf(upload.pdf);
          setPageCount(upload.pageCount);
          if (!title.trim())
            setTitle(
              upload.pdf.name.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ")
            );
        }}
      />

      <DocumentCoverField
        cover={cover}
        disabled={busy}
        onBusyChange={setUploadingCover}
        onChange={setCover}
      />

      <Input
        inputId="document-published-date"
        type="date"
        label="Tanggal Terbit"
        required
        value={publishedDate}
        onChange={(event) => setPublishedDate(event.target.value)}
      />

      <div className="rounded-xl border border-border p-4">
        <Switch
          switchId="document-active"
          label="Tampilkan untuk kader"
          description="Kalau dimatikan, pedoman disembunyikan dari HMI Connect."
          checked={isActive}
          onChange={setIsActive}
        />
      </div>

      <SheetFooter
        saving={saving}
        disabled={busy}
        onCancel={onClose}
        onSave={() => void handleSave()}
      />
    </div>
  );
}
