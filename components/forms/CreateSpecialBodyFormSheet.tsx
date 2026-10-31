"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createSpecialBody } from "@/lib/actions";
import { ADMIN_ENTITY_LABEL } from "@/lib/access";
import {
  SPECIAL_BODY_LABEL,
  suggestSpecialBodyName,
} from "@/lib/special-body";
import {
  isSuccessStatus,
  type AccessEntityTypeEnum,
  type SpecialBodyTypeEnum,
} from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import SearchableSelect, {
  type LoadOptionsResult,
  type SearchableOption,
} from "../fields/SearchableSelect";
import Select from "../fields/Select";
import TextArea from "../fields/TextArea";
import Sheet from "../modals/Sheet";
import SpecialBodyLogoField from "./SpecialBodyLogoField";

type ParentOption = { id: string; name: string };

interface CreateSpecialBodyFormSheetProps {
  open: boolean;
  type: SpecialBodyTypeEnum;
  parentLevels: AccessEntityTypeEnum[];
  organization: ParentOption | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function CreateSpecialBodyFormSheet({
  open,
  type,
  parentLevels,
  organization,
  onClose,
  onSaved,
}: CreateSpecialBodyFormSheetProps) {
  const label = SPECIAL_BODY_LABEL[type];
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Tambah ${label}`}
      description={`Pasang ${label} baru di bawah salah satu entitas HMI.`}
    >
      {open && (
        <CreateSpecialBodyFields
          type={type}
          parentLevels={parentLevels}
          organization={organization}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  );
}

async function loadSearchOptions(
  path: string,
  inputValue: string,
  page: number,
  extra: Record<string, string> = {},
): Promise<LoadOptionsResult> {
  const params = new URLSearchParams({ page: String(page), ...extra });
  if (inputValue) params.set("q", inputValue);
  const response = await fetch(`${path}?${params}`);
  if (!response.ok) return { options: [], hasMore: false };
  const json = await response.json();
  const results: ParentOption[] = json.data ?? [];
  return {
    options: results.map((item) => ({ label: item.name, value: item.id })),
    hasMore: Boolean(json.hasMore),
  };
}

// Mounted only while open, so state always starts fresh — no reset effect needed.
function CreateSpecialBodyFields({
  type,
  parentLevels,
  organization,
  onClose,
  onSaved,
}: Omit<CreateSpecialBodyFormSheetProps, "open">) {
  const label = SPECIAL_BODY_LABEL[type];
  const [parentLevel, setParentLevel] = useState<AccessEntityTypeEnum>(
    parentLevels[0] ?? "organization",
  );
  const [branch, setBranch] = useState<SearchableOption | null>(null);
  const [parent, setParent] = useState<SearchableOption | null>(null);
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const needsBranch =
    parentLevel === "coordinating_chapter" || parentLevel === "chapter";
  const selectedParent: ParentOption | null =
    parentLevel === "organization"
      ? organization
      : parent
        ? { id: String(parent.value), name: parent.label }
        : null;

  function applyParent(next: ParentOption | null, level = parentLevel) {
    if (nameTouched) return;
    setName(next ? suggestSpecialBodyName(type, level, next.name) : "");
  }

  function changeLevel(level: AccessEntityTypeEnum) {
    setParentLevel(level);
    setBranch(null);
    setParent(null);
    applyParent(level === "organization" ? organization : null, level);
  }

  function changeParent(option: SearchableOption | null) {
    setParent(option);
    applyParent(option ? { id: String(option.value), name: option.label } : null);
  }

  async function handleSubmit() {
    if (!selectedParent) {
      toast.error(`Pilih ${ADMIN_ENTITY_LABEL[parentLevel]} induknya.`);
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error(`Nama ${label} wajib diisi.`);
      return;
    }

    setIsSaving(true);
    try {
      const result = await createSpecialBody({
        type,
        parent_entity_type: parentLevel,
        parent_entity_id: selectedParent.id,
        name: trimmedName,
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(imageUrl ? { image_url: imageUrl } : {}),
      });
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? `Gagal menambahkan ${label}.`);
        return;
      }
      toast.success(`${label} berhasil ditambahkan.`);
      onSaved();
    } catch (error) {
      console.error("[CreateSpecialBodyFormSheet] save threw:", error);
      toast.error(`Gagal menambahkan ${label}. Coba lagi.`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SpecialBodyLogoField
        label={`Logo ${label}`}
        imageUrl={imageUrl}
        onChange={setImageUrl}
        onUploadingChange={setIsUploadingImage}
        disabled={isSaving}
      />

      {parentLevels.length > 1 ? (
        <Select
          selectId="special-body-parent-level"
          label="Tingkat"
          placeholder="Pilih tingkat"
          value={parentLevel}
          onChange={(value) =>
            value && changeLevel(value as AccessEntityTypeEnum)
          }
          options={parentLevels.map((level) => ({
            label: ADMIN_ENTITY_LABEL[level],
            value: level,
          }))}
          required
        />
      ) : null}

      {parentLevel === "organization" ? (
        <div className="flex flex-col gap-1">
          <p className="pl-1 text-[15px] font-medium text-heading">Induk</p>
          <p className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-sm text-heading">
            {organization?.name ?? "Organisasi tidak ditemukan"}
          </p>
        </div>
      ) : null}

      {parentLevel === "coordinating_body" && (
        <SearchableSelect
          key="coordinating_body"
          selectId="special-body-parent"
          label="Badko"
          placeholder="Cari Badko..."
          value={parent}
          onChange={changeParent}
          loadOptions={(input, page) =>
            loadSearchOptions("/api/coordinating-bodies/search", input, page)
          }
          required
        />
      )}

      {parentLevel === "branch" && (
        <SearchableSelect
          key="branch"
          selectId="special-body-parent"
          label="Cabang"
          placeholder="Cari Cabang..."
          value={parent}
          onChange={changeParent}
          loadOptions={(input, page) =>
            loadSearchOptions("/api/branches/search", input, page)
          }
          required
        />
      )}

      {needsBranch && (
        <SearchableSelect
          key={`${parentLevel}-branch`}
          selectId="special-body-branch"
          label="Cabang"
          placeholder="Cari Cabang..."
          value={branch}
          onChange={(option) => {
            setBranch(option);
            changeParent(null);
          }}
          loadOptions={(input, page) =>
            loadSearchOptions("/api/branches/search", input, page, {
              exclude_special: "true",
            })
          }
          required
        />
      )}

      {needsBranch && branch && (
        <SearchableSelect
          key={`${parentLevel}-${branch.value}`}
          selectId="special-body-parent"
          label={ADMIN_ENTITY_LABEL[parentLevel]}
          placeholder={`Cari ${ADMIN_ENTITY_LABEL[parentLevel]}...`}
          value={parent}
          onChange={changeParent}
          loadOptions={(input, page) =>
            loadSearchOptions(
              parentLevel === "chapter"
                ? "/api/chapters/search"
                : "/api/coordinating-chapters/search",
              input,
              page,
              { branch_id: String(branch.value) },
            )
          }
          required
        />
      )}

      <Input
        inputId="special-body-name"
        label={`Nama ${label}`}
        placeholder={`Contoh: ${label} HMI Cabang Banda Aceh`}
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setNameTouched(true);
        }}
        required
      />

      <TextArea
        textAreaId="special-body-description"
        label="Deskripsi"
        placeholder={`Ceritakan singkat tentang ${label} ini.`}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={4}
      />

      <div className="mt-2 flex justify-end gap-3 border-t border-border pt-4">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={() => void handleSubmit()}
          disabled={isSaving || isUploadingImage}
        >
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
