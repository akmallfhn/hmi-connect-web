"use client";

import { ChevronRight, ListTree } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { DocumentOutlineItem } from "@/apis/organizational-documents";
import { createOrganizationalDocument } from "@/lib/actions";
import {
  buildOutlineTree,
  flattenOutlineTree,
  type FlatOutlineRow,
} from "@/lib/organizational-document";
import Switch from "../buttons/Switch";
import Input from "../fields/Input";
import Sheet from "../modals/Sheet";
import {
  DocumentCoverField,
  DocumentPdfField,
  OutlineDraftFields,
  outlineErrorsFor,
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
  const [rows, setRows] = useState<FlatOutlineRow[]>([]);
  const [bookmarks, setBookmarks] = useState<DocumentOutlineItem[] | null>(
    null
  );
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);

  const outlineErrorCount = useMemo(
    () => Object.keys(outlineErrorsFor(rows, pageCount)).length,
    [pageCount, rows]
  );
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
    if (outlineErrorCount > 0) {
      toast.error("Ada bagian daftar isi yang belum lengkap.");
      setOutlineOpen(true);
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
        table_of_contents: buildOutlineTree(rows),
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
          setBookmarks(upload.bookmarks);
          if (upload.bookmarks?.length && rows.length === 0)
            setRows(flattenOutlineTree(upload.bookmarks));
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

      {pdf && (
        <div className="flex flex-col gap-1">
          <span className="pl-1 text-[15px] font-medium text-heading">
            Daftar Isi
          </span>
          <button
            type="button"
            onClick={() => setOutlineOpen(true)}
            disabled={busy}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60 ${
              showErrors && outlineErrorCount > 0
                ? "border-destructive"
                : "border-border"
            }`}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-foreground">
              <ListTree className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-heading">
                {rows.length > 0
                  ? `${rows.length} bagian`
                  : "Belum ada daftar isi"}
              </span>
              <span
                className={`block text-xs ${
                  showErrors && outlineErrorCount > 0
                    ? "text-destructive-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {showErrors && outlineErrorCount > 0
                  ? `${outlineErrorCount} bagian belum lengkap`
                  : "Susun bab dan pasal beserta halamannya"}
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </div>
      )}

      <SheetFooter
        saving={saving}
        disabled={busy}
        onCancel={onClose}
        onSave={() => void handleSave()}
      />

      <Sheet
        open={outlineOpen}
        onClose={() => setOutlineOpen(false)}
        size="xl"
        title="Daftar Isi"
        description={`${title.trim() || "Pedoman"}${pageCount ? ` · ${pageCount} halaman` : ""}`}
      >
        {outlineOpen && pdf && (
          <OutlineDraftFields
            initialRows={rows}
            pageCount={pageCount}
            pdfUrl={pdf.url}
            bookmarks={bookmarks}
            showErrorsInitially={showErrors && outlineErrorCount > 0}
            submitLabel="Simpan Daftar Isi"
            onBookmarksRead={setBookmarks}
            onCancel={() => setOutlineOpen(false)}
            onSubmit={(nextRows) => {
              setRows(nextRows);
              setOutlineOpen(false);
            }}
          />
        )}
      </Sheet>
    </div>
  );
}
