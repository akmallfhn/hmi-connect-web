"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createBranch } from "@/lib/actions";
import { stripEntityNamePrefix } from "@/lib/feed-author";
import { isSuccessStatus, type BranchTypeEnum } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import Select from "../fields/Select";
import SearchableSelect, { type SearchableOption } from "../fields/SearchableSelect";
import Sheet from "../modals/Sheet";
import BranchLogoField from "./BranchLogoField";
import { NO_COORDINATING_BODY_LABEL } from "@/lib/constants";

const TYPE_OPTIONS: { label: string; value: BranchTypeEnum }[] = [
  { label: "Penuh (Full)", value: "full" },
  { label: "Persiapan (Provisional)", value: "provisional" },
];

interface CreateBranchFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  defaultCoordinatingBody?: SearchableOption | null;
  // When true, the Badko field renders as fixed, read-only text instead of a searchable picker — used from a Badko's own scoped "Kelola Cabang" page so a new Cabang can't be attached to another Badko.
  lockCoordinatingBody?: boolean;
  organizationId?: string;
}

export default function CreateBranchFormSheet({
  open,
  onClose,
  onSaved,
  defaultCoordinatingBody = null,
  lockCoordinatingBody = false,
  organizationId,
}: CreateBranchFormSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Tambah Cabang"
      description="Buat Cabang HMI baru, di bawah sebuah Badko atau langsung di bawah PB HMI."
    >
      {open && (
        <CreateBranchFields
          defaultCoordinatingBody={defaultCoordinatingBody}
          lockCoordinatingBody={lockCoordinatingBody}
          organizationId={organizationId}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  );
}

// Mounted only while open, so state always starts fresh — no reset effect needed.
function CreateBranchFields({
  defaultCoordinatingBody,
  lockCoordinatingBody,
  organizationId,
  onClose,
  onSaved,
}: {
  defaultCoordinatingBody: SearchableOption | null;
  lockCoordinatingBody: boolean;
  organizationId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [type, setType] = useState<BranchTypeEnum>("full");
  const [coordinatingBody, setCoordinatingBody] =
    useState<SearchableOption | null>(defaultCoordinatingBody);
  const [isSpecial, setIsSpecial] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function loadCoordinatingBodyOptions(inputValue: string, page: number) {
    const params = new URLSearchParams({ page: String(page) });
    if (inputValue) params.set("q", inputValue);
    const response = await fetch(`/api/coordinating-bodies/search?${params}`);
    const json = await response.json();
    const results: { id: string; name: string }[] = json.data ?? [];
    return {
      options: results.map((item) => ({ label: item.name, value: item.id })),
      hasMore: Boolean(json.hasMore),
    };
  }

  async function handleSubmit() {
    const sanitizedName = stripEntityNamePrefix("branch", name);
    if (!sanitizedName) {
      toast.error("Nama Cabang wajib diisi.");
      return;
    }
    setIsSaving(true);
    try {
      const result = await createBranch({
        name: sanitizedName,
        image_url: imageUrl,
        type,
        status: "active",
        is_special: isSpecial,
        ...(organizationId ? { organization_id: organizationId } : {}),
        ...(!isSpecial && coordinatingBody
          ? { coordinating_body_id: String(coordinatingBody.value) }
          : {}),
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal membuat Cabang.");
        return;
      }

      toast.success("Cabang berhasil dibuat.");
      onSaved();
    } catch (err) {
      console.error("[CreateBranchFormSheet] save threw:", err);
      toast.error("Gagal membuat Cabang.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <BranchLogoField
        imageUrl={imageUrl}
        onChange={setImageUrl}
        onUploadingChange={setIsUploadingImage}
        disabled={isSaving}
      />

      <Input
        inputId="branch-name"
        label="Nama Cabang"
        placeholder="Contoh: Banda Aceh"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      {lockCoordinatingBody ? (
        <div className="flex flex-col gap-1">
          <label className="pl-1 text-[15px] font-medium text-heading">
            Badko
          </label>
          <p className="rounded-lg border border-border bg-surface-subtle px-3 py-2.5 text-sm text-heading">
            {coordinatingBody?.label ?? NO_COORDINATING_BODY_LABEL}
          </p>
        </div>
      ) : (
        !isSpecial && (
          <SearchableSelect
            selectId="branch-coordinating-body"
            label="Badko"
            placeholder="Cari Badko..."
            value={coordinatingBody}
            onChange={setCoordinatingBody}
            loadOptions={loadCoordinatingBodyOptions}
            defaultOptions={defaultCoordinatingBody ? [defaultCoordinatingBody] : []}
          />
        )
      )}

      {!lockCoordinatingBody && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="branch-is-special"
            className="flex w-fit cursor-pointer items-center gap-2 text-sm text-heading select-none"
          >
            <input
              id="branch-is-special"
              type="checkbox"
              checked={isSpecial}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsSpecial(checked);
                if (checked) {
                  setCoordinatingBody(null);
                }
              }}
              className="size-4 rounded border-border-strong accent-primary"
              disabled={isSaving}
            />
            Jadikan cabang istimewa
          </label>
          <p className="pl-6 text-[13px] text-muted-foreground">
            Cabang istimewa berada langsung di bawah PB HMI dan menerima kader secara langsung tanpa komisariat.
          </p>
        </div>
      )}

      <Select
        selectId="branch-type"
        label="Status"
        placeholder="Pilih status"
        value={type}
        onChange={(value) => setType(value as BranchTypeEnum)}
        options={TYPE_OPTIONS}
        required
      />

      <div className="mt-2 flex justify-end gap-3 border-t border-border pt-4">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSaving || isUploadingImage}
        >
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
