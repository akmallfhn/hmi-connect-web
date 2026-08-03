"use client";

import { ImageOff, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import type { TrainingDetail } from "@/apis/trainings";
import { createTraining, updateTraining } from "@/lib/actions";
import { compressImage } from "@/lib/compressImage";
import { supabase } from "@/lib/supabase";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
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

const IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const IMAGE_ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];
const IMAGE_MAX_RAW_BYTES = 20 * 1024 * 1024;
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

async function uploadTrainingImage(file: File, fileExt: string) {
  const filePath = `training/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("hmi-connect")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("hmi-connect").getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error("missing public url");

  return data.publicUrl;
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
  const [name, setName] = useState(training?.name ?? "");
  const [description, setDescription] = useState(training?.description ?? "");
  const [startDate, setStartDate] = useState(training?.start_date ?? "");
  const [endDate, setEndDate] = useState(training?.end_date ?? "");
  const [locationName, setLocationName] = useState(
    training?.location_name ?? ""
  );
  const [locationUrl, setLocationUrl] = useState(training?.location_url ?? "");
  const [imageUrl, setImageUrl] = useState(training?.image_url ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  function handleImagePickClick() {
    imageInputRef.current?.click();
  }

  async function handleImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
      toast.error("Format hanya boleh JPG, PNG, WEBP, atau AVIF.");
      return;
    }
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !IMAGE_ALLOWED_EXTENSIONS.includes(fileExt)) {
      toast.error("Ekstensi file tidak valid.");
      return;
    }
    if (file.size > IMAGE_MAX_RAW_BYTES) {
      toast.error("Ukuran gambar maksimal 20MB.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const compressed = await compressImage(file);
      if (compressed.size > IMAGE_MAX_BYTES) {
        toast.error("Gambar masih terlalu besar setelah dikompres.");
        return;
      }
      const compressedExt = compressed.name.split(".").pop()?.toLowerCase() ?? fileExt;
      const publicUrl = await uploadTrainingImage(compressed, compressedExt);
      setImageUrl(publicUrl);
    } catch (error) {
      console.error("[TrainingFormSheet] image upload threw:", error);
      toast.error("Gagal mengunggah gambar. Coba lagi.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleSubmit() {
    if (!name.trim() || !startDate || !endDate) {
      toast.error("Nama dan tanggal pelaksanaan wajib diisi.");
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
            name: name.trim(),
            description: description.trim(),
            start_date: startDate,
            end_date: endDate,
            location_name: locationName.trim(),
            location_url: locationUrl.trim(),
            image_url: imageUrl,
          })
        : await createTraining({
            name: name.trim(),
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
            ...(imageUrl ? { image_url: imageUrl } : {}),
          });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan batch LK2.");
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
        <label className="pl-1 text-[15px] font-medium text-[#172033]">
          Gambar Batch
        </label>
        <div className="flex items-center gap-4">
          <div className="aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-lg border border-[#e6e9ef] bg-[#f5f7fb]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Gambar batch"
                width={80}
                height={100}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-[#5f6573]">
                <ImageOff className="size-5" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={imageInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.avif"
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
                onClick={() => setImageUrl("")}
                disabled={isUploadingImage || isSaving}
                className="w-fit"
              >
                <Trash2 className="size-3.5" />
                Hapus Gambar
              </Button>
            )}
            <p className="text-xs text-[#5f6573]">
              Rasio potret 4:5, maksimal 5MB.
            </p>
          </div>
        </div>
      </div>
      <Input
        inputId="training-name"
        label="Nama Batch"
        placeholder="Contoh: LK2 HMI Cabang Banda Aceh 2026"
        value={name}
        onChange={(event) => setName(event.target.value)}
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

      <div className="mt-2 flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
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
