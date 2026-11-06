"use client";

import { ImageOff, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import type { TrainingDetail } from "@/apis/trainings";
import { createTraining, saveBranchTrainingContact, saveBranchTrainingCover, updateTraining } from "@/lib/actions";
import {
  TRAINING_POSTER_ACCEPT,
  uploadTrainingPoster,
} from "@/lib/training-poster";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import SearchableSelect, {
  type SearchableOption,
} from "../fields/SearchableSelect";
import TextArea from "../fields/TextArea";
import Sheet from "../modals/Sheet";
import { useBranch } from "@/hooks/useBranch";

interface TrainingFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  branchId: string;
  training: TrainingDetail | null;
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function TrainingFormSheet({
  open,
  onClose,
  onSaved,
  branchId,
  training,
}: TrainingFormSheetProps) {
  const { branchName } = useBranch();

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={training ? "Edit Batch LK2" : "Tambah Batch LK2"}
      description={
        training
          ? "Perbarui informasi pelaksanaan Latihan Kader 2."
          : `Buat pelaksanaan Latihan Kader 2 di Cabang ${branchName}.`
      }
    >
      {open && (
        <TrainingFields
          branchId={branchId}
          training={training}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  );
}

function TrainingFields({
  branchId,
  training,
  onClose,
  onSaved,
}: Omit<TrainingFormSheetProps, "open">) {
  const [description, setDescription] = useState(training?.description ?? "");
  const [startDate, setStartDate] = useState(training?.start_date ?? "");
  const [endDate, setEndDate] = useState(training?.end_date ?? "");
  const [locationName, setLocationName] = useState(
    training?.location_name ?? ""
  );
  const [locationUrl, setLocationUrl] = useState(training?.location_url ?? "");
  const [imageUrl, setImageUrl] = useState(training?.image_url ?? "");
  // null means the poster was not touched, so an edit leaves the stored one alone.
  const [imageMediaId, setImageMediaId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [contactPerson, setContactPerson] = useState<SearchableOption | null>(
    training?.contacts?.[0]?.user_id && training.contacts[0].name
        ? {
          label: training.contacts[0].name,
          value: training.contacts[0].user_id,
          image: training.contacts[0].avatar,
        }
      : null
  );
  const contactPersonDefaultOptions: SearchableOption[] =
    training?.contacts?.[0]?.user_id && training.contacts[0].name
      ? [
          {
            label: training.contacts[0].name,
            value: training.contacts[0].user_id,
            image: training.contacts[0].avatar,
          },
        ]
      : [];

  async function loadContactPersonOptions(inputValue: string, page: number) {
    const params = new URLSearchParams({
      q: inputValue,
      page: String(page),
      branch_id: branchId,
    });
    const response = await fetch(`/api/users/search?${params}`);
    const json = await response.json();
    const results: {
      id: string;
      full_name: string;
      avatar?: string;
    }[] = json.data ?? [];
    return {
      options: results.map((item) => ({
        label: item.full_name,
        value: item.id,
        image: item.avatar,
      })),
      hasMore: Boolean(json.hasMore),
    };
  }

  function handleImagePickClick() {
    imageInputRef.current?.click();
  }

  async function handleImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploadingImage(true);
    const result = await uploadTrainingPoster(file);
    setIsUploadingImage(false);
    if (result.ok) {
      setImageUrl(result.url);
      setImageMediaId(result.assetId);
    } else {
      toast.error(result.message);
    }
  }

  async function handleSubmit() {
    if (!startDate || !endDate) {
      toast.error("Tanggal pelaksanaan wajib diisi.");
      return;
    }
    if (!contactPerson) {
      toast.error("Contact person wajib dipilih.");
      return;
    }
    if (endDate < startDate) {
      toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }
    if (locationUrl.trim() && !isValidHttpUrl(locationUrl.trim())) {
      toast.error("Tautan lokasi harus berupa URL http atau https yang valid.");
      return;
    }

    setIsSaving(true);
    try {
      const result = training
        ? await updateTraining({
            id: training.id,
            description: description.trim(),
            start_date: startDate,
            end_date: endDate,
            location_name: locationName.trim(),
            location_url: locationUrl.trim(),
          })
        : await createTraining({
            ...(description.trim() ? { description: description.trim() } : {}),
            level: "LK2",
            organizer_type: "branch",
            organizer_id: branchId,
            start_date: startDate,
            end_date: endDate,
            ...(locationName.trim()
              ? { location_name: locationName.trim() }
              : {}),
            ...(locationUrl.trim()
              ? { location_url: locationUrl.trim() }
              : {}),
          });

      if (!isSuccessStatus(result.status) || !result.data) {
        toast.error(result.message ?? "Gagal menyimpan batch LK2.");
        return;
      }
      const currentCover = training?.images?.find((image) => image.role === "cover")?.media_id ?? null;
      const cover = await saveBranchTrainingCover(result.data.id, branchId,
        imageMediaId === null ? currentCover : imageMediaId || null);
      const contact = await saveBranchTrainingContact(result.data.id, branchId, String(contactPerson.value));
      if (!cover.ok || !contact.ok) {
        toast.error(`Batch tersimpan, tetapi lampirannya belum lengkap. ${!cover.ok ? cover.message : contact.message}`);
        onSaved();
        return;
      }
      toast.success(
        training ? "Batch LK2 berhasil diperbarui." : "Batch LK2 berhasil dibuat."
      );
      onSaved();
    } catch (error) {
      console.error("[TrainingFormSheet] save threw:", error);
      toast.error("Gagal menyimpan batch LK2.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="pl-1 text-[15px] font-medium text-heading">
          Gambar Batch
        </label>
        <div className="flex items-center gap-4">
          <div className="aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Gambar batch"
                width={80}
                height={100}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <ImageOff className="size-5" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={imageInputRef}
              type="file"
              accept={TRAINING_POSTER_ACCEPT}
              className="hidden"
              onChange={handleImageFileChange}
            />
            <Button
              variant="light"
              size="sm"
              onClick={handleImagePickClick}
              disabled={isUploadingImage || isSaving}
              className="w-fit"
            >
              {isUploadingImage ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              {isUploadingImage ? "Mengunggah..." : "Unggah Gambar"}
            </Button>
            {imageUrl && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setImageUrl("");
                  setImageMediaId("");
                }}
                disabled={isUploadingImage || isSaving}
                className="w-fit"
              >
                <Trash2 className="size-3.5" />
                Hapus Gambar
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Rasio potret 4:5, maksimal 5MB.
            </p>
          </div>
        </div>
      </div>
      <SearchableSelect
        selectId="training-contact-person"
        label="Contact Person"
        placeholder="Cari nama atau username..."
        value={contactPerson}
        onChange={setContactPerson}
        loadOptions={loadContactPersonOptions}
        defaultOptions={contactPersonDefaultOptions}
        debounceMs={300}
        showOptionAvatar
        required
      />
      <TextArea
        textAreaId="training-description"
        label="Deskripsi"
        placeholder="Deskripsi singkat pelaksanaan LK2"
        rows={4}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          inputId="training-start-date"
          label="Tanggal Mulai"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          required
        />
        <Input
          inputId="training-end-date"
          label="Tanggal Selesai"
          type="date"
          min={startDate || undefined}
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          required
        />
      </div>
      <Input
        inputId="training-location-name"
        label="Lokasi"
        placeholder="Contoh: Aula Insan Cita"
        value={locationName}
        onChange={(event) => setLocationName(event.target.value)}
      />
      <Input
        inputId="training-location-url"
        label="Tautan Lokasi"
        type="url"
        placeholder="https://maps.google.com/..."
        value={locationUrl}
        onChange={(event) => setLocationUrl(event.target.value)}
      />

      <div className="mt-2 flex justify-end gap-3 border-t border-border pt-4">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
