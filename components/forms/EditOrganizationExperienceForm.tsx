"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { SearchEntityResult } from "@/apis/search";
import type { OrganizationExperienceEntry } from "@/apis/users";
import {
  createOrganizationExperience,
  deleteOrganizationExperience,
  updateOrganizationExperience,
} from "@/lib/actions";
import { formatMentionEntityName } from "@/lib/feed-author";
import type { MentionEntityTypeEnum } from "@/lib/types";
import { pastYears } from "@/lib/year-options";
import Input from "../fields/Input";
import SearchableSelect, {
  type LoadOptionsResult,
  type SearchableOption,
} from "../fields/SearchableSelect";
import TextArea from "../fields/TextArea";
import YearSelect from "../fields/YearSelect";
import Modal from "../modals/Modal";
import LogoHmi from "../svg/LogoHmi";
import ProfileEntryFormFooter from "./ProfileEntryFormFooter";
import { runProfileEntryMutation } from "@/lib/profile-entry-mutation";

type OrganizationExperienceType = "hmi" | "non_hmi";

type HmiEntityOption = SearchableOption & {
  entityId: string;
  entityType: MentionEntityTypeEnum;
};

interface EditOrganizationExperienceFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  experienceType: OrganizationExperienceType;
  // null adds a new entry; an entry edits (or deletes) that one row.
  entry: OrganizationExperienceEntry | null;
}

async function loadHmiEntityOptions(
  inputValue: string,
  page: number,
): Promise<LoadOptionsResult> {
  const keyword = inputValue.trim();
  if (!keyword) return { options: [], hasMore: false };

  const params = new URLSearchParams({
    q: keyword,
    page: String(page),
    page_size: "20",
  });
  const response = await fetch(`/api/entities/search?${params}`);
  if (!response.ok) return { options: [], hasMore: false };

  const payload = (await response.json()) as {
    data?: SearchEntityResult[];
    hasMore?: boolean;
  };
  return {
    options: (payload.data ?? []).map((entity) => ({
      label: formatMentionEntityName(
        entity.entity_type,
        entity.entity_name,
        entity.entity_mention_name,
      ),
      value: `${entity.entity_type}:${entity.entity_id}`,
      image: entity.entity_image_url ?? undefined,
      entityId: entity.entity_id,
      entityType: entity.entity_type,
    }) satisfies HmiEntityOption),
    hasMore: payload.hasMore ?? false,
  };
}

export default function EditOrganizationExperienceForm({
  open,
  onClose,
  onSaved,
  experienceType,
  entry,
}: EditOrganizationExperienceFormProps) {
  const typeLabel = experienceType === "hmi" ? "Organisasi HMI" : "Organisasi (Non-HMI)";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${entry ? "Edit" : "Tambah"} Riwayat ${typeLabel}`}
    >
      {open && (
        <OrganizationExperienceFields
          key={entry?.id ?? `new-${experienceType}`}
          onClose={onClose}
          onSaved={onSaved}
          experienceType={experienceType}
          entry={entry}
        />
      )}
    </Modal>
  );
}

// Mounted only while open (and keyed by entry), so fields always seed fresh -- no reset effect needed.
function OrganizationExperienceFields({
  onClose,
  onSaved,
  experienceType,
  entry,
}: Omit<EditOrganizationExperienceFormProps, "open">) {
  const hmiEntry = entry?.experience_type === "hmi" ? entry : null;
  const nonHmiEntry = entry?.experience_type === "non_hmi" ? entry : null;
  const isHmi = experienceType === "hmi";
  const [hmiEntity, setHmiEntity] = useState<HmiEntityOption | null>(
    hmiEntry
      ? {
          label: formatMentionEntityName(
            hmiEntry.entity_type,
            hmiEntry.entity_name,
            hmiEntry.entity_mention_name_normalized,
          ),
          value: `${hmiEntry.entity_type}:${hmiEntry.entity_id}`,
          image: hmiEntry.entity_image_url ?? undefined,
          entityId: hmiEntry.entity_id,
          entityType: hmiEntry.entity_type,
        }
      : null,
  );
  const [organizationName, setOrganizationName] = useState(
    nonHmiEntry?.organization_name ?? "",
  );
  const [positionTitle, setPositionTitle] = useState(entry?.position_title ?? "");
  const [startYear, setStartYear] = useState(entry ? String(entry.start_year) : "");
  const [endYear, setEndYear] = useState(entry?.end_year ? String(entry.end_year) : "");
  const [isOngoing, setIsOngoing] = useState(entry ? !entry.end_year : false);
  const [description, setDescription] = useState(entry?.description ?? "");
  const [isSaving, setIsSaving] = useState(false);

  function handleSubmit() {
    const hasOrganization = isHmi ? Boolean(hmiEntity) : Boolean(organizationName.trim());
    if (!hasOrganization || !positionTitle.trim() || !startYear.trim()) {
      toast.error("Lengkapi organisasi, jabatan, dan tahun mulai.");
      return;
    }
    if (!isOngoing && !endYear.trim()) {
      toast.error("Pilih tahun selesai, atau centang jika masih berlangsung.");
      return;
    }

    const start = Number(startYear);
    const end = isOngoing ? null : Number(endYear);
    if (end !== null && end < start) {
      toast.error("Tahun selesai tidak boleh sebelum tahun mulai.");
      return;
    }

    const commonFields = {
      position_title: positionTitle.trim(),
      start_year: start,
      description: description.trim(),
      end_year: end ?? undefined,
    };
    const fields = isHmi && hmiEntity
      ? {
          ...commonFields,
          experience_type: "hmi" as const,
          entity_type: hmiEntity.entityType,
          entity_id: hmiEntity.entityId,
        }
      : {
          ...commonFields,
          experience_type: "non_hmi" as const,
          organization_name: organizationName.trim(),
        };

    void runProfileEntryMutation(
      () =>
        entry
          ? updateOrganizationExperience({
              id: entry.id,
              ...fields,
              end_year: end ?? 0,
            })
          : createOrganizationExperience(fields),
      {
        success: entry
          ? "Riwayat organisasi berhasil diperbarui."
          : "Riwayat organisasi berhasil ditambahkan.",
        failure: "Gagal menyimpan riwayat organisasi.",
        setSaving: setIsSaving,
        onDone: onSaved,
        tag: "EditOrganizationExperienceForm",
      },
    );
  }

  function handleDelete() {
    if (!entry) return;
    void runProfileEntryMutation(() => deleteOrganizationExperience(entry.id), {
      success: "Riwayat organisasi berhasil dihapus.",
      failure: "Gagal menghapus riwayat organisasi.",
      setSaving: setIsSaving,
      onDone: onSaved,
      tag: "EditOrganizationExperienceForm",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {isHmi ? (
        <SearchableSelect
          selectId="hmi-organization-entity"
          label="Institusi HMI"
          placeholder="Cari PB HMI, Badko, Cabang, Korkom, atau Komisariat"
          value={hmiEntity}
          onChange={(option) => setHmiEntity(option as HmiEntityOption | null)}
          loadOptions={loadHmiEntityOptions}
          defaultOptions={hmiEntity ? [hmiEntity] : []}
          debounceMs={300}
          disabled={isSaving}
          noOptionsMessage="Institusi HMI tidak ditemukan."
          showOptionAvatar
          optionAvatarFallback={<LogoHmi className="h-4 w-auto" aria-hidden="true" />}
          required
        />
      ) : (
        <Input
          inputId="non-hmi-organization-name"
          label="Nama Organisasi"
          placeholder="Contoh: BEM Universitas Indonesia"
          value={organizationName}
          disabled={isSaving}
          onChange={(event) => setOrganizationName(event.target.value)}
          required
        />
      )}
      <Input
        inputId={`${experienceType}-organization-position`}
        label="Jabatan"
        placeholder={isHmi ? "Contoh: Ketua Bidang PTKP" : "Contoh: Ketua Umum"}
        value={positionTitle}
        disabled={isSaving}
        onChange={(event) => setPositionTitle(event.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <YearSelect
          selectId={`${experienceType}-organization-start`}
          label="Tahun Mulai"
          value={startYear}
          onChange={setStartYear}
          years={pastYears()}
          disabled={isSaving}
          required
        />
        {!isOngoing && (
          <YearSelect
            selectId={`${experienceType}-organization-end`}
            label="Tahun Selesai"
            value={endYear}
            onChange={setEndYear}
            years={pastYears()}
            minYear={startYear ? Number(startYear) : undefined}
            disabled={isSaving}
            required
          />
        )}
      </div>
      <label
        htmlFor={`${experienceType}-organization-ongoing`}
        className="flex w-fit cursor-pointer items-center gap-2 text-sm text-heading select-none"
      >
        <input
          id={`${experienceType}-organization-ongoing`}
          type="checkbox"
          checked={isOngoing}
          onChange={(event) => setIsOngoing(event.target.checked)}
          className="size-4 rounded border-border-strong accent-primary"
          disabled={isSaving}
        />
        {isHmi
          ? "Saya masih aktif di institusi HMI ini"
          : "Saya masih aktif di organisasi ini"}
      </label>
      <TextArea
        textAreaId={`${experienceType}-organization-description`}
        label="Deskripsi"
        placeholder={
          isHmi
            ? "Ceritakan peran atau programmu di HMI"
            : "Ceritakan peran atau programmu di organisasi ini"
        }
        value={description}
        disabled={isSaving}
        onChange={(event) => setDescription(event.target.value)}
        rows={3}
        characterLength={240}
      />

      <ProfileEntryFormFooter
        isSaving={isSaving}
        onCancel={onClose}
        onSubmit={handleSubmit}
        onDelete={entry ? handleDelete : undefined}
        deleteMessage={`Hapus riwayat ${isHmi ? "organisasi HMI" : "organisasi non-HMI"} ini?`}
      />
    </div>
  );
}
