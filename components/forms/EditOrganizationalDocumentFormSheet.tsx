"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { OrganizationalDocumentDetail } from "@/apis/organizational-documents";
import { updateOrganizationalDocument } from "@/lib/actions";
import { ORGANIZATIONAL_DOCUMENT_TYPE_OPTIONS } from "@/lib/organizational-document";
import type { OrganizationalDocumentTypeEnum } from "@/lib/types";
import { localDateKey } from "@/lib/time-manipulation";
import Switch from "../buttons/Switch";
import Input from "../fields/Input";
import Select from "../fields/Select";
import Sheet from "../modals/Sheet";
import {
  DocumentCoverField,
  DocumentDetailLoader,
  DocumentPdfField,
  fileNameFromUrl,
  maxOutlinePage,
  SheetFooter,
  toPublishedAt,
  useMissingPageCount,
  type UploadedCover,
  type UploadedPdf,
} from "./OrganizationalDocumentFields";

interface EditOrganizationalDocumentFormSheetProps {
  documentId: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditOrganizationalDocumentFormSheet({
  documentId,
  onClose,
  onSaved,
}: EditOrganizationalDocumentFormSheetProps) {
  return (
    <Sheet
      open={documentId !== null}
      onClose={onClose}
      title="Edit Pedoman"
      description="Perbarui file dan informasi pedoman ini."
    >
      {documentId !== null && (
        <DocumentDetailLoader key={documentId} documentId={documentId}>
          {(document) => (
            <EditDocumentFields
              document={document}
              onClose={onClose}
              onSaved={onSaved}
            />
          )}
        </DocumentDetailLoader>
      )}
    </Sheet>
  );
}

function EditDocumentFields({
  document,
  onClose,
  onSaved,
}: {
  document: OrganizationalDocumentDetail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initialPublishedDate = localDateKey(new Date(document.published_at));
  const [title, setTitle] = useState(document.title);
  const [type, setType] = useState<OrganizationalDocumentTypeEnum>(
    document.type
  );
  const [pdf, setPdf] = useState<UploadedPdf>({
    mediaId: document.file_media_id,
    url: document.file_url,
    name: fileNameFromUrl(document.file_url),
  });
  const [cover, setCover] = useState<UploadedCover | null>(
    document.image_media_id && document.image_url
      ? { mediaId: document.image_media_id, url: document.image_url }
      : null
  );
  const [pageCount, setPageCount] = useState<number | null>(
    document.page_count
  );
  const [publishedDate, setPublishedDate] = useState(initialPublishedDate);
  const [isActive, setIsActive] = useState(document.status === "active");
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const busy = uploadingPdf || uploadingCover || saving;

  useMissingPageCount(pdf.url, pageCount, setPageCount);

  async function handleSave() {
    setShowErrors(true);
    if (!title.trim()) {
      toast.error("Judul pedoman wajib diisi.");
      return;
    }
    if (!publishedDate) {
      toast.error("Tanggal terbit wajib diisi.");
      return;
    }
    // The table of contents is edited on its own, so a shorter replacement PDF must not orphan its pages.
    const lastOutlinePage = maxOutlinePage(document.table_of_contents ?? []);
    if (pageCount && lastOutlinePage > pageCount) {
      toast.error(
        `PDF baru hanya ${pageCount} halaman, tapi daftar isi menunjuk halaman ${lastOutlinePage}. Sesuaikan daftar isinya dulu.`
      );
      return;
    }

    const status = isActive ? "active" : "inactive";
    setSaving(true);
    try {
      const result = await updateOrganizationalDocument({
        id: document.id,
        ...(title.trim() !== document.title ? { title: title.trim() } : {}),
        ...(type !== document.type ? { type } : {}),
        ...(pdf.mediaId !== document.file_media_id
          ? { file_media_id: pdf.mediaId }
          : {}),
        ...((cover?.mediaId ?? null) !== document.image_media_id
          ? { image_media_id: cover?.mediaId ?? "" }
          : {}),
        ...(pageCount && pageCount !== document.page_count
          ? { page_count: pageCount }
          : {}),
        ...(status !== document.status ? { status } : {}),
        ...(publishedDate !== initialPublishedDate
          ? { published_at: toPublishedAt(publishedDate) }
          : {}),
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Pedoman berhasil diperbarui.");
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

      <Select
        selectId="document-type"
        label="Tipe Dokumen"
        placeholder="Pilih tipe dokumen"
        value={type}
        onChange={(value) =>
          setType(value as OrganizationalDocumentTypeEnum)
        }
        options={ORGANIZATIONAL_DOCUMENT_TYPE_OPTIONS}
        required
      />

      <DocumentPdfField
        pdf={pdf}
        pageCount={pageCount}
        invalid={false}
        disabled={busy}
        onBusyChange={setUploadingPdf}
        onUploaded={(upload) => {
          setPdf(upload.pdf);
          setPageCount(upload.pageCount);
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
