"use client";

import { ImageOff, Info, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import type { TrainingDetail } from "@/apis/trainings";
import { createTraining, updateTraining } from "@/lib/actions";
import { formatOrganizerName } from "@/lib/organizer";
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
import TrainingPageShell, {
  type TrainingViewer,
} from "../trainings/TrainingPageShell";

interface TrainingCreatePageProps {
  viewer: TrainingViewer;
  training?: TrainingDetail;
}

const LEVEL_OPTIONS: { label: string; value: TrainingStatusEnum }[] = [
  { label: "Latihan Kader 1 (LK1)", value: "LK1" },
  { label: "Latihan Kader 2 (LK2)", value: "LK2" },
  { label: "Latihan Kader 3 (LK3)", value: "LK3" },
];

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function TrainingCreatePage({
  viewer,
  training,
}: TrainingCreatePageProps) {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState(training?.image_url ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [name, setName] = useState(training?.name ?? "");
  const [level, setLevel] = useState<TrainingStatusEnum | null>(
    training?.level ?? null,
  );
  const [organizerName, setOrganizerName] = useState(
    training?.organizer_name ?? "",
  );
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
  const isEditing = Boolean(training);
  // An entity-organized event keeps its name tied to the entity, so it isn't editable here.
  const organizerLocked = Boolean(training?.organizer_type);
  const busy = isSaving || isUploadingImage;

  async function handleImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploadingImage(true);
    const result = await uploadTrainingPoster(file);
    setIsUploadingImage(false);
    if (result.ok) setImageUrl(result.url);
    else toast.error(result.message);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !level || !startDate || !endDate) {
      toast.error("Nama, tingkat, dan tanggal pelaksanaan wajib diisi.");
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
            level,
            ...(organizerLocked
              ? {}
              : { organizer_name: organizerName.trim() }),
            description: description.trim(),
            start_date: startDate,
            end_date: endDate,
            location_name: locationName.trim(),
            location_url: locationUrl.trim(),
            image_url: imageUrl,
          })
        : await createTraining({
            name: name.trim(),
            level,
            start_date: startDate,
            end_date: endDate,
            ...(organizerName.trim()
              ? { organizer_name: organizerName.trim() }
              : {}),
            ...(description.trim() ? { description: description.trim() } : {}),
            ...(locationName.trim()
              ? { location_name: locationName.trim() }
              : {}),
            ...(locationUrl.trim()
              ? { location_url: locationUrl.trim() }
              : {}),
            ...(imageUrl ? { image_url: imageUrl } : {}),
          });

      if (!isSuccessStatus(result.status) || !result.data) {
        toast.error(result.message ?? "Gagal menyimpan event.");
        setIsSaving(false);
        return;
      }
      toast.success(isEditing ? "Event berhasil diperbarui." : "Event berhasil dibuat.");
      router.push(`/trainings/${result.data.id}`);
    } catch (error) {
      console.error("[TrainingCreatePage] save threw:", error);
      toast.error("Gagal menyimpan event.");
      setIsSaving(false);
    }
  }

  return (
    <TrainingPageShell
      viewer={viewer}
      mobileBackTitle={isEditing ? "Edit Event Training" : "Buat Event Training"}
      hideBottomNav
    >
      <main>
        <PageMargin className="py-5 lg:py-8">
          <div className="mx-auto w-full max-w-[720px]">
            <div className="hidden lg:block">
              <h1 className="font-stack-sans-headline text-2xl font-medium text-heading">
                {isEditing ? "Edit Event Training" : "Buat Event Training"}
              </h1>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 lg:mt-6 lg:rounded-xl lg:border lg:border-border lg:p-6"
            >
              <div className="flex flex-col gap-1">
                <span className="pl-1 text-[15px] font-medium text-heading">
                  Poster Event
                </span>
                <div className="flex items-center gap-4">
                  <div className="aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt="Poster event"
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
                        onClick={() => setImageUrl("")}
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

              <Input
                inputId="event-name"
                label="Nama Event"
                placeholder="Contoh: LK1 HMI Komisariat Teknik 2026"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
              <Select
                selectId="event-level"
                label="Tingkat"
                placeholder="Pilih tingkat Latihan Kader"
                value={level}
                onChange={(value) => setLevel(value as TrainingStatusEnum)}
                options={LEVEL_OPTIONS}
                required
              />
              <Input
                inputId="event-organizer-name"
                label="Nama Penyelenggara"
                placeholder="Contoh: HMI Komisariat Fakultas Teknik"
                value={
                  organizerLocked && training
                    ? formatOrganizerName(training)
                    : organizerName
                }
                onChange={(event) => setOrganizerName(event.target.value)}
                disabled={organizerLocked}
              />
              <TextArea
                textAreaId="event-description"
                label="Deskripsi"
                placeholder="Ceritakan agenda, syarat peserta, dan hal penting lainnya"
                rows={5}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  inputId="event-start-date"
                  label="Tanggal Mulai"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  required
                />
                <Input
                  inputId="event-end-date"
                  label="Tanggal Selesai"
                  type="date"
                  min={startDate || undefined}
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  required
                />
              </div>
              <Input
                inputId="event-location-name"
                label="Lokasi"
                placeholder="Contoh: Aula Insan Cita"
                value={locationName}
                onChange={(event) => setLocationName(event.target.value)}
              />
              <Input
                inputId="event-location-url"
                label="Tautan Lokasi"
                type="url"
                placeholder="https://maps.google.com/..."
                value={locationUrl}
                onChange={(event) => setLocationUrl(event.target.value)}
              />

              <p className="flex items-start gap-2 rounded-lg bg-surface-muted p-3 text-sm text-muted-foreground">
                <Info className="mt-0.5 size-4 shrink-0 text-primary-foreground" />
                Kamu otomatis menjadi contact person event ini, dan pendaftaran
                langsung dibuka setelah event dibuat.
              </p>

              <div className="mt-2 flex justify-end gap-3 border-t border-border pt-4">
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
                      : "Buat Event"}
                </Button>
              </div>
            </form>
          </div>
        </PageMargin>
      </main>
    </TrainingPageShell>
  );
}
