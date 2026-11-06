"use client";

import { ImageOff, Info, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import type { TrainingDetail } from "@/apis/trainings";
import type { ComposerAuthorEntity } from "../forms/CreateFeedForms";
import { createTraining, deleteTraining, saveTrainingImages, updateTraining } from "@/lib/actions";
import { MANAGE_TRAININGS_HREF } from "@/lib/access";
import { allowedTrainingLevels, TRAINING_LEVEL_LABEL } from "@/lib/training-levels";
import {
  TRAINING_POSTER_ACCEPT,
  uploadTrainingPoster,
} from "@/lib/training-poster";
import {
  isSuccessStatus,
  type TrainingStatusEnum,
} from "@/lib/types";
import Button from "../buttons/Button";
import PageMargin from "../common/PageMargin";
import Input from "../fields/Input";
import Select from "../fields/Select";
import TextArea from "../fields/TextArea";
import AlertConfirmation from "../modals/AlertConfirmation";
import OfficialPageShell from "../official/OfficialPageShell";

interface TrainingCreatePageProps {
  entity: ComposerAuthorEntity;
  training?: TrainingDetail;
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function TrainingCreatePage({
  entity,
  training,
}: TrainingCreatePageProps) {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState(training?.image_url ?? "");
  // null means the poster was not touched, so an edit leaves the stored one alone.
  const [imageMediaId, setImageMediaId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const allowedLevels = allowedTrainingLevels(entity.type, entity.bodyType, entity.parentType);
  const levelOptions = allowedLevels.map((value) => ({ label: TRAINING_LEVEL_LABEL[value], value }));
  const [level, setLevel] = useState<TrainingStatusEnum | null>(training?.level ?? allowedLevels[0] ?? null);
  const [description, setDescription] = useState(training?.description ?? "");
  const [startDate, setStartDate] = useState(training?.start_date ?? "");
  const [endDate, setEndDate] = useState(training?.end_date ?? "");
  const [locationName, setLocationName] = useState(
    training?.location_name ?? "",
  );
  const [locationUrl, setLocationUrl] = useState(
    training?.location_url ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isEditing = Boolean(training);
  const busy = isSaving || isUploadingImage;

  async function handleDelete() {
    if (!training) return;
    setIsSaving(true);
    try {
      const result = await deleteTraining(training.id);
      if (!isSuccessStatus(result.status)) throw new Error(result.message);
      toast.success("Training berhasil dihapus.");
      router.replace(MANAGE_TRAININGS_HREF);
    } catch {
      toast.error("Training belum berhasil dihapus.");
      setIsSaving(false);
    }
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!level || !allowedLevels.includes(level) || !startDate || !endDate) {
      toast.error("Tingkat dan tanggal pelaksanaan wajib diisi.");
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
            level,
            description: description.trim(),
            start_date: startDate,
            end_date: endDate,
            location_name: locationName.trim(),
            location_url: locationUrl.trim(),
          })
        : await createTraining({
            level,
            organizer_type: entity.type,
            organizer_id: entity.id,
            start_date: startDate,
            end_date: endDate,
            ...(description.trim() ? { description: description.trim() } : {}),
            ...(locationName.trim()
              ? { location_name: locationName.trim() }
              : {}),
            ...(locationUrl.trim()
              ? { location_url: locationUrl.trim() }
              : {}),
          });

      if (!isSuccessStatus(result.status) || !result.data) {
        toast.error(result.message ?? "Gagal menyimpan training.");
        setIsSaving(false);
        return;
      }
      const currentCover = training?.images?.find((image) => image.role === "cover")?.media_id ?? null;
      const savedImages = await saveTrainingImages(result.data.id,
        imageMediaId === null ? currentCover : imageMediaId || null,
        training?.images?.filter((image) => image.role === "gallery").map((image) => image.media_id) ?? []);
      if (!savedImages.ok) {
        toast.error(`Training tersimpan, tetapi poster gagal disimpan. ${savedImages.message}`);
        router.push(`${MANAGE_TRAININGS_HREF}/${result.data.id}`);
        return;
      }
      toast.success(isEditing ? "Training berhasil diperbarui." : "Training berhasil dibuat.");
      router.push(MANAGE_TRAININGS_HREF);
    } catch (error) {
      console.error("[TrainingCreatePage] save threw:", error);
      toast.error("Gagal menyimpan training.");
      setIsSaving(false);
    }
  }

  return (
    <OfficialPageShell entity={entity} compactGreeting>
      <main>
        <PageMargin className="py-5 lg:py-8">
          <div className="mx-auto w-full max-w-[720px]">
            <div className="hidden lg:block">
              <h1 className="font-stack-sans-headline text-2xl font-medium text-heading">
                {isEditing ? "Edit Training" : "Buat Training"}
              </h1>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 lg:mt-6 lg:rounded-xl lg:border lg:border-border lg:p-6"
            >
              <div className="flex flex-col gap-1">
                <span className="pl-1 text-[15px] font-medium text-heading">
                  Poster Training
                </span>
                <div className="flex items-center gap-4">
                  <div className="aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt="Poster training"
                        width={96}
                        height={120}
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
                      onClick={() => imageInputRef.current?.click()}
                      disabled={busy}
                      className="w-fit"
                    >
                      {isUploadingImage ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Upload className="size-3.5" />
                      )}
                      {isUploadingImage ? "Mengunggah..." : "Unggah Poster"}
                    </Button>
                    {imageUrl && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setImageUrl("");
                          setImageMediaId("");
                        }}
                        disabled={busy}
                        className="w-fit"
                      >
                        <Trash2 className="size-3.5" />
                        Hapus Poster
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Rasio potret 4:5, maksimal 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <Select
                selectId="training-level"
                label="Tingkat"
                placeholder="Pilih tingkat Latihan Kader"
                value={level}
                onChange={(value) => setLevel(value as TrainingStatusEnum)}
                options={levelOptions}
                disabled={levelOptions.length <= 1}
                required
              />
              <Input
                inputId="training-organizer-name"
                label="Nama Penyelenggara"
                placeholder="Contoh: HMI Komisariat Fakultas Teknik"
                value={entity.name}
                disabled
              />
              <TextArea
                textAreaId="training-description"
                label="Deskripsi"
                placeholder="Ceritakan agenda, syarat peserta, dan hal penting lainnya"
                rows={5}
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

              <p className="flex items-start gap-2 rounded-lg bg-surface-muted p-3 text-sm text-muted-foreground">
                <Info className="mt-0.5 size-4 shrink-0 text-primary-foreground" />
                Training akan diterbitkan atas nama {entity.name}.
              </p>

              <div className="mt-2 flex flex-wrap justify-end gap-3 border-t border-border pt-4">
                {training && (
                  <Button variant="destructive" onClick={() => setDeleteOpen(true)} disabled={busy} className="mr-auto">
                    <Trash2 className="size-4" />Hapus training
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSaving}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={busy}>
                  {isSaving
                    ? "Menyimpan..."
                    : isEditing
                      ? "Simpan Perubahan"
                      : "Buat Training"}
                </Button>
              </div>
            </form>
          </div>
        </PageMargin>
      </main>
      <AlertConfirmation
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Hapus training?"
        message={`Training “${training?.name ?? ""}” akan dihapus dan tidak dapat dipulihkan.`}
        confirmLabel="Hapus training"
        loading={isSaving}
      />
    </OfficialPageShell>
  );
}
