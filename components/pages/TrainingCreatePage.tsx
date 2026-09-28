"use client";

import { ImageOff, Info, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { createTraining } from "@/lib/actions";
import {
  TRAINING_POSTER_ACCEPT,
  uploadTrainingPoster,
} from "@/lib/training-poster";
import {
  isSuccessStatus,
  type TrainingOrganizerTypeEnum,
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

export type TrainingOrganizerChoice = {
  type: TrainingOrganizerTypeEnum;
  id: string;
  name: string; // bare name, since every organizer display adds its own level prefix
  label: string;
};

interface TrainingCreatePageProps {
  viewer: TrainingViewer;
  organizers: TrainingOrganizerChoice[];
}

const CUSTOM_ORGANIZER = "custom";

const LEVEL_OPTIONS: { label: string; value: TrainingStatusEnum }[] = [
  { label: "Latihan Kader 1 (LK1)", value: "LK1" },
  { label: "Latihan Kader 2 (LK2)", value: "LK2" },
  { label: "Latihan Kader 3 (LK3)", value: "LK3" },
];

function organizerKey(organizer: TrainingOrganizerChoice) {
  return `${organizer.type}:${organizer.id}`;
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
  viewer,
  organizers,
}: TrainingCreatePageProps) {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<TrainingStatusEnum | null>(null);
  const [organizerValue, setOrganizerValue] = useState(
    organizers[0] ? organizerKey(organizers[0]) : CUSTOM_ORGANIZER
  );
  const [customOrganizerName, setCustomOrganizerName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedOrganizer = organizers.find(
    (organizer) => organizerKey(organizer) === organizerValue
  );
  const organizerOptions = [
    ...organizers.map((organizer) => ({
      label: organizer.label,
      value: organizerKey(organizer),
    })),
    { label: "Lainnya (tulis sendiri)", value: CUSTOM_ORGANIZER },
  ];
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

    const organizerName = selectedOrganizer
      ? selectedOrganizer.name
      : customOrganizerName.trim();

    setIsSaving(true);
    try {
      const result = await createTraining({
        name: name.trim(),
        level,
        start_date: startDate,
        end_date: endDate,
        ...(selectedOrganizer
          ? {
              organizer_type: selectedOrganizer.type,
              organizer_id: selectedOrganizer.id,
            }
          : {}),
        ...(organizerName ? { organizer_name: organizerName } : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(locationName.trim() ? { location_name: locationName.trim() } : {}),
        ...(locationUrl.trim() ? { location_url: locationUrl.trim() } : {}),
        ...(imageUrl ? { image_url: imageUrl } : {}),
      });

      if (!isSuccessStatus(result.status) || !result.data) {
        toast.error(result.message ?? "Gagal membuat event.");
        setIsSaving(false);
        return;
      }
      toast.success("Event berhasil dibuat.");
      router.push(`/trainings/${result.data.id}`);
    } catch (error) {
      console.error("[TrainingCreatePage] create threw:", error);
      toast.error("Gagal membuat event.");
      setIsSaving(false);
    }
  }

  return (
    <TrainingPageShell
      viewer={viewer}
      mobileBackTitle="Buat Event"
      hideBottomNav
    >
      <main>
        <PageMargin className="py-5 lg:py-8">
          <div className="mx-auto w-full max-w-[720px]">
            <div className="hidden lg:block">
              <h1 className="font-stack-sans-headline text-2xl font-medium text-[#172033]">
                Buat Event
              </h1>
              <p className="mt-1 text-sm text-[#5f6573]">
                Umumkan agenda Latihan Kader agar kader lain bisa mendaftar.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 lg:mt-6 lg:rounded-xl lg:border lg:border-[#e1e5ec] lg:p-6"
            >
              <div className="flex flex-col gap-1">
                <span className="pl-1 text-[15px] font-medium text-[#172033]">
                  Poster Event
                </span>
                <div className="flex items-center gap-4">
                  <div className="aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-lg border border-[#e6e9ef] bg-[#f5f7fb]">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt="Poster event"
                        width={96}
                        height={120}
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
                    <p className="text-xs text-[#5f6573]">
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
              <Select
                selectId="event-organizer"
                label="Penyelenggara"
                placeholder="Pilih penyelenggara"
                value={organizerValue}
                onChange={(value) =>
                  setOrganizerValue(String(value ?? CUSTOM_ORGANIZER))
                }
                options={organizerOptions}
              />
              {!selectedOrganizer && (
                <Input
                  inputId="event-organizer-name"
                  label="Nama Penyelenggara"
                  placeholder="Contoh: HMI Komisariat Fakultas Teknik"
                  value={customOrganizerName}
                  onChange={(event) =>
                    setCustomOrganizerName(event.target.value)
                  }
                />
              )}
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

              <p className="flex items-start gap-2 rounded-lg bg-[#f5f7fb] p-3 text-sm text-[#5f6573]">
                <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                Kamu otomatis menjadi contact person event ini, dan pendaftaran
                langsung dibuka setelah event dibuat.
              </p>

              <div className="mt-2 flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSaving}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={busy}>
                  {isSaving ? "Menyimpan..." : "Buat Event"}
                </Button>
              </div>
            </form>
          </div>
        </PageMargin>
      </main>
    </TrainingPageShell>
  );
}
