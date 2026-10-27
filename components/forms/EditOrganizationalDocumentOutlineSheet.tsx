"use client";

import { useState } from "react";
import { toast } from "sonner";
import type {
  DocumentOutlineItem,
  OrganizationalDocumentDetail,
} from "@/apis/organizational-documents";
import { updateOrganizationalDocument } from "@/lib/actions";
import {
  buildOutlineTree,
  flattenOutlineTree,
  type FlatOutlineRow,
} from "@/lib/organizational-document";
import Sheet from "../modals/Sheet";
import {
  DocumentDetailLoader,
  OutlineDraftFields,
  useMissingPageCount,
} from "./OrganizationalDocumentFields";

interface EditOrganizationalDocumentOutlineSheetProps {
  documentId: number | null;
  documentTitle?: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditOrganizationalDocumentOutlineSheet({
  documentId,
  documentTitle,
  onClose,
  onSaved,
}: EditOrganizationalDocumentOutlineSheetProps) {
  return (
    <Sheet
      open={documentId !== null}
      onClose={onClose}
      size="xl"
      title="Atur Daftar Isi"
      description={documentTitle}
    >
      {documentId !== null && (
        <DocumentDetailLoader key={documentId} documentId={documentId}>
          {(document) => (
            <OutlineFields
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

function OutlineFields({
  document,
  onClose,
  onSaved,
}: {
  document: OrganizationalDocumentDetail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [initialRows] = useState<FlatOutlineRow[]>(() =>
    flattenOutlineTree(document.table_of_contents ?? [])
  );
  const [pageCount, setPageCount] = useState<number | null>(
    document.page_count
  );
  const [bookmarks, setBookmarks] = useState<DocumentOutlineItem[] | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  useMissingPageCount(document.file_url, pageCount, setPageCount);

  async function handleSubmit(rows: FlatOutlineRow[]) {
    setSaving(true);
    try {
      const result = await updateOrganizationalDocument({
        id: document.id,
        table_of_contents: buildOutlineTree(rows),
        ...(pageCount && pageCount !== document.page_count
          ? { page_count: pageCount }
          : {}),
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Daftar isi berhasil disimpan.");
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {pageCount
          ? `Dokumen ini ${pageCount} halaman.`
          : "Menghitung jumlah halaman..."}
      </p>
      <OutlineDraftFields
        initialRows={initialRows}
        pageCount={pageCount}
        pdfUrl={document.file_url}
        bookmarks={bookmarks}
        submitting={saving}
        submitLabel="Simpan Daftar Isi"
        onBookmarksRead={setBookmarks}
        onCancel={onClose}
        onSubmit={(rows) => void handleSubmit(rows)}
      />
    </div>
  );
}
