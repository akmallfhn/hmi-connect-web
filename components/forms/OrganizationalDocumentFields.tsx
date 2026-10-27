"use client";

import {
  FileText,
  ImagePlus,
  LoaderCircle,
  Trash2,
  Upload,
  WandSparkles,
} from "lucide-react";
import {
  ChangeEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import type {
  DocumentOutlineItem,
  OrganizationalDocumentDetail,
} from "@/apis/organizational-documents";
import { getOrganizationalDocumentDetail } from "@/lib/actions";
import { uploadPublicMediaFile } from "@/lib/media-upload";
import {
  flattenOutlineTree,
  inspectPdf,
  type FlatOutlineRow,
} from "@/lib/organizational-document";
import {
  compressPdf,
  PDF_TARGET_BYTES,
  prepareDocumentCover,
} from "@/lib/organizational-document-media";
import DocumentOutlineEditor from "../admin/DocumentOutlineEditor";
import Button from "../buttons/Button";
import AlertConfirmation from "../modals/AlertConfirmation";

const MAX_RAW_PDF_BYTES = 30 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;
const MAX_RAW_COVER_BYTES = 20 * 1024 * 1024;
const COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type UploadedPdf = {
  mediaId: string;
  url: string;
  name: string;
  size?: number;
};

export type UploadedCover = { mediaId: string; url: string };

export function fileNameFromUrl(url: string) {
  try {
    return decodeURIComponent(
      new URL(url).pathname.split("/").pop() ?? "dokumen.pdf"
    );
  } catch {
    return "dokumen.pdf";
  }
}

export function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)}MB`
    : `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

// Midnight WIB on the chosen day, which is how an editor thinks of a publication date.
export function toPublishedAt(date: string) {
  return new Date(`${date}T00:00:00+07:00`).toISOString();
}

export function outlineErrorsFor(
  rows: FlatOutlineRow[],
  pageCount: number | null
) {
  const errors: Record<string, string> = {};
  for (const row of rows) {
    const page = Number(row.page);
    if (!row.title.trim()) errors[row.key] = "Judul bagian wajib diisi.";
    else if (!row.page || page < 1)
      errors[row.key] = "Isi nomor halaman bagian ini.";
    else if (pageCount && page > pageCount)
      errors[row.key] =
        `Halaman melebihi jumlah halaman dokumen (${pageCount}).`;
  }
  return errors;
}

export function maxOutlinePage(items: DocumentOutlineItem[]): number {
  return items.reduce(
    (max, item) =>
      Math.max(max, item.page, maxOutlinePage(item.children ?? [])),
    0
  );
}

// A document saved without a page count still gets one, read from its own PDF.
export function useMissingPageCount(
  pdfUrl: string | null,
  pageCount: number | null,
  onRead: (pageCount: number) => void
) {
  const onReadRef = useRef(onRead);
  useEffect(() => {
    onReadRef.current = onRead;
  });
  useEffect(() => {
    if (!pdfUrl || pageCount) return;
    let active = true;
    inspectPdf(pdfUrl)
      .then((inspected) => {
        if (active) onReadRef.current(inspected.pageCount);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [pdfUrl, pageCount]);
}

export function DocumentDetailLoader({
  documentId,
  children,
}: {
  documentId: number;
  children: (document: OrganizationalDocumentDetail) => ReactNode;
}) {
  const [document, setDocument] = useState<OrganizationalDocumentDetail | null>(
    null
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    getOrganizationalDocumentDetail(documentId)
      .then((detail) => {
        if (!active) return;
        if (detail) setDocument(detail);
        else setFailed(true);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [documentId]);

  if (failed) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Pedoman tidak dapat dimuat. Tutup lalu coba lagi.
      </p>
    );
  }
  if (!document) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin text-primary" />
        Memuat pedoman...
      </div>
    );
  }
  return <>{children(document)}</>;
}

export function DocumentPdfField({
  pdf,
  pageCount,
  invalid,
  disabled,
  onBusyChange,
  onUploaded,
}: {
  pdf: UploadedPdf | null;
  pageCount: number | null;
  invalid: boolean;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
  onUploaded: (upload: {
    pdf: UploadedPdf;
    pageCount: number | null;
    bookmarks: DocumentOutlineItem[] | null;
  }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"compressing" | "uploading" | null>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error("File harus berformat PDF.");
      return;
    }
    if (file.size > MAX_RAW_PDF_BYTES) {
      toast.error("Ukuran PDF maksimal 30MB sebelum dikompres.");
      return;
    }
    setStep("compressing");
    onBusyChange(true);
    try {
      const inspected = await inspectPdf(file).catch(() => null);
      const compressed = await compressPdf(file).catch(() => file);
      if (compressed.size > MAX_PDF_BYTES) {
        toast.error(
          `PDF masih ${formatBytes(compressed.size)} setelah dikompres. Maksimal 10MB.`
        );
        return;
      }
      setStep("uploading");
      const uploaded = await uploadPublicMediaFile(
        new File([compressed], file.name, { type: "application/pdf" }),
        "document"
      );
      onUploaded({
        pdf: {
          mediaId: uploaded.assetId,
          url: uploaded.publicUrl,
          name: file.name,
          size: compressed.size,
        },
        pageCount: inspected?.pageCount ?? null,
        bookmarks: inspected?.outline ?? null,
      });
      const sizeNote =
        compressed.size < file.size
          ? `, dikompres dari ${formatBytes(file.size)} jadi ${formatBytes(compressed.size)}`
          : "";
      const floorNote =
        compressed.size > PDF_TARGET_BYTES
          ? " Sebagian besar isinya teks, jadi tidak bisa lebih kecil tanpa mengorbankan kualitas."
          : "";
      toast.success(`PDF diunggah${sizeNote}.${floorNote}`);
    } catch (error) {
      console.error("[DocumentPdfField] upload PDF threw:", error);
      toast.error("Gagal mengunggah PDF. Coba lagi.");
    } finally {
      setStep(null);
      onBusyChange(false);
    }
  }

  const meta = [
    pdf?.size ? formatBytes(pdf.size) : null,
    pageCount ? `${pageCount} halaman` : "Menghitung halaman...",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-1">
      <span className="pl-1 text-[15px] font-medium text-heading">
        File PDF <span className="text-destructive-foreground">*</span>
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => void handleChange(event)}
      />
      {pdf && !step ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-subtle p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-foreground">
            <FileText className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <a
              href={pdf.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm font-semibold text-heading hover:text-primary-foreground"
            >
              {pdf.name}
            </a>
            <p className="text-xs tabular-nums text-muted-foreground">{meta}</p>
          </div>
          <Button
            variant="soft"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
          >
            <Upload className="size-3.5" />
            Ganti
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || step !== null}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition hover:border-primary hover:bg-primary-soft/40 disabled:cursor-not-allowed ${
            invalid ? "border-destructive" : "border-border-strong"
          }`}
        >
          {step ? (
            <LoaderCircle className="size-6 animate-spin text-primary" />
          ) : (
            <Upload className="size-6 text-primary" />
          )}
          <span className="text-sm font-semibold text-heading">
            {step === "compressing"
              ? "Mengompres PDF..."
              : step === "uploading"
                ? "Mengunggah PDF..."
                : "Pilih file PDF"}
          </span>
          <span className="text-xs text-muted-foreground">
            Dikompres otomatis tanpa mengubah teks. Jumlah halaman dan bookmark
            dibaca dari PDF.
          </span>
        </button>
      )}
    </div>
  );
}

export function DocumentCoverField({
  cover,
  disabled,
  onBusyChange,
  onChange,
}: {
  cover: UploadedCover | null;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
  onChange: (cover: UploadedCover | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!COVER_TYPES.includes(file.type)) {
      toast.error("Sampul harus JPG, PNG, atau WEBP.");
      return;
    }
    if (file.size > MAX_RAW_COVER_BYTES) {
      toast.error("Ukuran gambar maksimal 20MB.");
      return;
    }
    setUploading(true);
    onBusyChange(true);
    try {
      const prepared = await prepareDocumentCover(file);
      const uploaded = await uploadPublicMediaFile(prepared, "document_cover");
      onChange({ mediaId: uploaded.assetId, url: uploaded.publicUrl });
    } catch (error) {
      console.error("[DocumentCoverField] upload cover threw:", error);
      toast.error("Gagal mengunggah sampul. Coba lagi.");
    } finally {
      setUploading(false);
      onBusyChange(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="pl-1 text-[15px] font-medium text-heading">Sampul</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => void handleChange(event)}
      />
      <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-surface-subtle">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.url}
            alt="Sampul pedoman"
            className="h-full w-full object-cover"
          />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center transition hover:bg-primary-soft/40 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <LoaderCircle className="size-6 animate-spin text-primary" />
            ) : (
              <ImagePlus className="size-6 text-primary" />
            )}
            <span className="text-sm font-semibold text-heading">
              {uploading ? "Mengunggah sampul..." : "Pilih sampul"}
            </span>
            <span className="text-xs text-muted-foreground">
              Opsional · dipotong ke rasio 16:9 dan dikompres otomatis
            </span>
          </button>
        )}
        {cover && (
          <div className="absolute right-2 top-2 flex gap-1.5">
            <Button
              variant="light"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || uploading}
            >
              {uploading ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                "Ganti"
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onChange(null)}
              disabled={disabled || uploading}
              aria-label="Hapus sampul"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Edits a draft copy; the caller only receives the rows once they pass validation.
export function OutlineDraftFields({
  initialRows,
  pageCount,
  pdfUrl,
  bookmarks,
  showErrorsInitially = false,
  submitting = false,
  submitLabel,
  onBookmarksRead,
  onCancel,
  onSubmit,
}: {
  initialRows: FlatOutlineRow[];
  pageCount: number | null;
  pdfUrl: string;
  bookmarks: DocumentOutlineItem[] | null;
  showErrorsInitially?: boolean;
  submitting?: boolean;
  submitLabel: string;
  onBookmarksRead: (outline: DocumentOutlineItem[]) => void;
  onCancel: () => void;
  onSubmit: (rows: FlatOutlineRow[]) => void;
}) {
  const [draft, setDraft] = useState(initialRows);
  const [showErrors, setShowErrors] = useState(showErrorsInitially);
  const [readingBookmarks, setReadingBookmarks] = useState(false);
  const [confirmImport, setConfirmImport] = useState<
    DocumentOutlineItem[] | null
  >(null);
  const errors = useMemo(
    () => outlineErrorsFor(draft, pageCount),
    [draft, pageCount]
  );

  function applyBookmarks(outline: DocumentOutlineItem[]) {
    setDraft(flattenOutlineTree(outline));
    setConfirmImport(null);
    toast.success(`${outline.length} bagian utama diambil dari bookmark PDF.`);
  }

  function offerBookmarks(outline: DocumentOutlineItem[]) {
    if (outline.length === 0) {
      toast.info(
        "PDF ini tidak punya bookmark. Isi daftar isinya secara manual."
      );
      return;
    }
    if (draft.length === 0) applyBookmarks(outline);
    else setConfirmImport(outline);
  }

  async function readBookmarks() {
    if (bookmarks) {
      offerBookmarks(bookmarks);
      return;
    }
    setReadingBookmarks(true);
    try {
      const inspected = await inspectPdf(pdfUrl);
      onBookmarksRead(inspected.outline);
      offerBookmarks(inspected.outline);
    } catch (error) {
      console.error("[OutlineDraftFields] read bookmarks threw:", error);
      toast.error(
        "PDF tidak bisa dibaca dari sini. Unggah ulang file-nya untuk mengambil bookmark."
      );
    } finally {
      setReadingBookmarks(false);
    }
  }

  function handleSubmit() {
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      toast.error("Lengkapi bagian yang ditandai merah dulu.");
      return;
    }
    onSubmit(draft);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl bg-surface-subtle p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Baris yang menjorok jadi sub-bagian dari baris di atasnya.
        </p>
        <Button
          variant="soft"
          size="sm"
          onClick={() => void readBookmarks()}
          disabled={readingBookmarks || submitting}
        >
          {readingBookmarks ? (
            <LoaderCircle className="size-3.5 animate-spin" />
          ) : (
            <WandSparkles className="size-3.5" />
          )}
          Ambil dari Bookmark
        </Button>
      </div>

      <DocumentOutlineEditor
        rows={draft}
        onChange={setDraft}
        errors={showErrors ? errors : {}}
      />

      <div className="sticky bottom-0 -mx-5 -mb-4 flex justify-end gap-3 border-t border-border bg-surface px-5 py-4">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Batal
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Menyimpan..." : submitLabel}
        </Button>
      </div>

      <AlertConfirmation
        open={confirmImport !== null}
        onClose={() => setConfirmImport(null)}
        onConfirm={() => confirmImport && applyBookmarks(confirmImport)}
        title="Ganti daftar isi?"
        message="Daftar isi yang sudah kamu susun akan diganti dengan bookmark dari PDF."
        confirmLabel="Ganti"
        confirmVariant="primary"
      />
    </div>
  );
}

export function SheetFooter({
  saving,
  disabled,
  onCancel,
  onSave,
}: {
  saving: boolean;
  disabled: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="sticky bottom-0 -mx-5 -mb-4 flex justify-end gap-3 border-t border-border bg-surface px-5 py-4">
      <Button variant="outline" onClick={onCancel} disabled={saving}>
        Batal
      </Button>
      <Button variant="primary" onClick={onSave} disabled={disabled}>
        {saving ? "Menyimpan..." : "Simpan"}
      </Button>
    </div>
  );
}
