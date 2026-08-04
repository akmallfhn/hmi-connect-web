"use client";

import {
  CalendarDays,
  CheckCircle2,
  FileText,
  ImageOff,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Send,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import type { TrainingDetail } from "@/apis/trainings";
import type { TrainingHistoryEntry } from "@/apis/users";
import {
  createTrainingHistory,
  deleteTrainingHistory,
  registerTraining,
  updateMyProfile,
  updateTrainingHistory,
} from "@/lib/actions";
import { supabase } from "@/lib/supabase";
import { formatDateRange } from "@/lib/time-manipulation";
import {
  isSuccessStatus,
  type TrainingResultEnum,
  type TrainingStatusEnum,
} from "@/lib/types";
import Button from "../buttons/Button";
import PageMargin from "../common/PageMargin";
import Input from "../fields/Input";
import NumberInput from "../fields/NumberInput";
import Select from "../fields/Select";
import {
  TrainingLevelLabel,
  TrainingRegistrationLabel,
} from "../trainings/TrainingLabels";
import TrainingPageShell, {
  type TrainingViewer,
} from "../trainings/TrainingPageShell";

export interface TrainingRegistrant {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  branchName?: string;
}

interface TrainingRegistrationPageProps {
  viewer: TrainingViewer;
  registrant: TrainingRegistrant;
  training: TrainingDetail;
  trainingHistories: TrainingHistoryEntry[];
}

type TrainingHistoryDraft = {
  clientId: string;
  id?: string;
  level: TrainingStatusEnum;
  result: TrainingResultEnum;
  organizerName: string;
  year: string;
};

const LEVEL_OPTIONS: { label: string; value: TrainingStatusEnum }[] = [
  { label: "Latihan Kader 1 (LK1)", value: "LK1" },
  { label: "Latihan Kader 2 (LK2)", value: "LK2" },
  { label: "Latihan Kader 3 (LK3)", value: "LK3" },
];

const RESULT_OPTIONS: { label: string; value: TrainingResultEnum }[] = [
  { label: "Lulus", value: "passed" },
  { label: "Lulus Bersyarat", value: "conditional_pass" },
  { label: "Tidak Lulus", value: "failed" },
];

const REQUIRED_HISTORY_LEVELS: Record<
  TrainingStatusEnum,
  TrainingStatusEnum[]
> = {
  LK1: [],
  LK2: ["LK1"],
  LK3: ["LK1", "LK2"],
};

const DOCUMENT_ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const DOCUMENT_ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];
const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

function buildHistoryDrafts(
  trainingLevel: TrainingStatusEnum,
  histories: TrainingHistoryEntry[]
): TrainingHistoryDraft[] {
  const drafts: TrainingHistoryDraft[] = histories.map((history) => ({
    clientId: `history-${history.id}`,
    id: history.id,
    level: history.level,
    result: history.result,
    organizerName: history.organizer_name,
    year: String(history.year),
  }));

  for (const level of REQUIRED_HISTORY_LEVELS[trainingLevel]) {
    if (drafts.some((draft) => draft.level === level)) continue;
    drafts.push({
      clientId: `required-${level}`,
      level,
      result: "passed",
      organizerName: "",
      year: "",
    });
  }

  return drafts;
}

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function uploadTrainingDocument(
  file: File,
  trainingId: string,
  userId: string
) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension) throw new Error("Ekstensi dokumen tidak ditemukan.");

  const filePath = [
    "training",
    "training_documents",
    trainingId,
    `${userId}-${Date.now()}.${extension}`,
  ].join("/");

  const { error } = await supabase.storage
    .from("hmi-connect")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("hmi-connect").getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error("URL dokumen tidak tersedia.");

  return data.publicUrl;
}

function TrainingEventCard({ training }: { training: TrainingDetail }) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <section className="rounded-lg border border-[#dfe3ea] bg-white p-3 sm:p-4">
        <div className="flex items-stretch gap-4 lg:block">
          <div className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-lg bg-[#edf1f6] sm:w-36 lg:w-full">
            {training.image_url ? (
              <Image
                src={training.image_url}
                alt={`Poster ${training.name}`}
                fill
                priority
                sizes="(max-width: 1023px) 144px, 340px"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-[#9298a5]">
                <ImageOff className="size-8" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 py-1 pr-1 lg:px-1 lg:pb-1 lg:pt-4">
            <div className="flex flex-wrap gap-1.5">
              <TrainingLevelLabel level={training.level} />
              <TrainingRegistrationLabel
                isOpen={training.is_registration_open}
              />
            </div>
            <h2 className="mt-2 line-clamp-2 text-base font-bold leading-6 text-[#172033] lg:text-lg">
              {training.name}
            </h2>
            <div className="mt-3 flex flex-col gap-2 text-[13px] leading-5 text-[#5f6573] lg:text-sm">
              <p className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 size-4 shrink-0" />
                <span>
                  {formatDateRange(training.start_date, training.end_date)}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>
                  {training.location_name ?? "Lokasi belum ditentukan"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}

export default function TrainingRegistrationPage({
  viewer,
  registrant,
  training,
  trainingHistories,
}: TrainingRegistrationPageProps) {
  const [fullName, setFullName] = useState(registrant.fullName);
  const [phoneNumber, setPhoneNumber] = useState(registrant.phoneNumber ?? "");
  const [historyDrafts, setHistoryDrafts] = useState<TrainingHistoryDraft[]>(
    () => buildHistoryDrafts(training.level, trainingHistories)
  );
  const [deletedHistoryIds, setDeletedHistoryIds] = useState<string[]>([]);
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const paperInputRef = useRef<HTMLInputElement>(null);

  function updateHistoryDraft<K extends keyof TrainingHistoryDraft>(
    clientId: string,
    key: K,
    value: TrainingHistoryDraft[K]
  ) {
    setHistoryDrafts((current) =>
      current.map((draft) =>
        draft.clientId === clientId ? { ...draft, [key]: value } : draft
      )
    );
  }

  function addHistoryDraft() {
    const missingRequiredLevel = REQUIRED_HISTORY_LEVELS[training.level].find(
      (level) => !historyDrafts.some((draft) => draft.level === level)
    );
    setHistoryDrafts((current) => [
      ...current,
      {
        clientId: `new-${crypto.randomUUID()}`,
        level: missingRequiredLevel ?? "LK1",
        result: "passed",
        organizerName: "",
        year: "",
      },
    ]);
  }

  function removeHistoryDraft(clientId: string) {
    const draft = historyDrafts.find((entry) => entry.clientId === clientId);
    const historyId = draft?.id;
    if (historyId) {
      setDeletedHistoryIds((current) =>
        current.includes(historyId) ? current : [...current, historyId]
      );
    }
    setHistoryDrafts((current) =>
      current.filter((entry) => entry.clientId !== clientId)
    );
  }

  function handlePaperChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (
      !extension ||
      !DOCUMENT_ALLOWED_EXTENSIONS.includes(extension) ||
      (file.type && !DOCUMENT_ALLOWED_TYPES.includes(file.type))
    ) {
      toast.error("Makalah harus berupa PDF, DOC, atau DOCX.");
      return;
    }
    if (file.size > DOCUMENT_MAX_BYTES) {
      toast.error("Ukuran makalah maksimal 10MB.");
      return;
    }

    setPaperFile(file);
  }

  function validateForm() {
    if (!training.is_registration_open) {
      return "Pendaftaran training ini sudah ditutup.";
    }
    if (!fullName.trim() || !phoneNumber.trim()) {
      return "Nama lengkap dan nomor HP wajib diisi.";
    }

    const missingRequiredLevel = REQUIRED_HISTORY_LEVELS[training.level].find(
      (level) => !historyDrafts.some((draft) => draft.level === level)
    );
    if (missingRequiredLevel) {
      return `Tambahkan riwayat ${missingRequiredLevel} untuk mendaftar ${training.level}.`;
    }

    const currentYear = new Date().getFullYear();
    const incompleteHistory = historyDrafts.find(
      (draft) =>
        !draft.organizerName.trim() ||
        !draft.year ||
        Number(draft.year) < 1947 ||
        Number(draft.year) > currentYear
    );
    if (incompleteHistory) {
      return `Lengkapi riwayat ${incompleteHistory.level} dengan penyelenggara dan tahun yang valid.`;
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationMessage = validateForm();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      toast.error(validationMessage);
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const profileResult = await updateMyProfile({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
      });
      if (!isSuccessStatus(profileResult.status)) {
        throw new Error(
          profileResult.message ?? "Data peserta gagal diperbarui."
        );
      }

      for (const historyId of deletedHistoryIds) {
        const deleteResult = await deleteTrainingHistory(historyId);
        if (!isSuccessStatus(deleteResult.status)) {
          throw new Error(
            deleteResult.message ?? "Riwayat training gagal dihapus."
          );
        }
      }

      for (const draft of historyDrafts) {
        const historyResult = draft.id
          ? await updateTrainingHistory({
              id: draft.id,
              level: draft.level,
              result: draft.result,
              organizer_name: draft.organizerName.trim(),
              year: Number(draft.year),
            })
          : await createTrainingHistory({
              level: draft.level,
              result: draft.result,
              organizer_name: draft.organizerName.trim(),
              year: Number(draft.year),
            });

        if (!isSuccessStatus(historyResult.status)) {
          throw new Error(
            historyResult.message ?? `Riwayat ${draft.level} gagal diperbarui.`
          );
        }
      }

      const paperUrl = paperFile
        ? await uploadTrainingDocument(paperFile, training.id, registrant.id)
        : undefined;
      const registrationResult = await registerTraining({
        training_id: training.id,
        ...(paperUrl ? { paper_url: paperUrl } : {}),
      });

      if (!isSuccessStatus(registrationResult.status)) {
        const message =
          registrationResult.status === "CONFLICT"
            ? registrationResult.message ===
              "already registered for this training"
              ? "Kamu sudah terdaftar pada training ini."
              : (registrationResult.message ??
                "Riwayat kaderisasi belum memenuhi persyaratan training.")
            : registrationResult.status === "UNAUTHORIZED"
              ? "Sesi berakhir. Silakan masuk kembali."
              : (registrationResult.message ??
                "Pendaftaran training gagal diproses.");
        throw new Error(message);
      }

      setRegistered(true);
      toast.success("Pendaftaran training berhasil.");
    } catch (error) {
      console.error("[TrainingRegistrationPage] submit threw:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Pendaftaran training gagal diproses.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <TrainingPageShell
      viewer={viewer}
      mobileBackTitle="Pendaftaran Training"
      bgClassName="bg-[#f4f6f9]"
    >
      <main>
        <PageMargin className="py-4 lg:py-8">
          <div className="grid items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8">
            <TrainingEventCard training={training} />

            <div className="min-w-0">
              {registered ? (
                <section className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-[#dfe3ea] border-t-[6px] border-t-primary bg-white px-6 text-center">
                  <CheckCircle2 className="size-14 text-primary" />
                  <h1 className="mt-5 text-2xl font-bold text-[#172033]">
                    Pendaftaran Berhasil
                  </h1>
                  <p className="mt-2 max-w-md text-[15px] leading-6 text-[#5f6573]">
                    Data pendaftaranmu telah tercatat sebagai peserta{" "}
                    {training.name}.
                  </p>
                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <Link href={`/trainings/${training.id}`}>
                      <Button variant="outline">Lihat Detail</Button>
                    </Link>
                    <Link href="/trainings">
                      <Button>Training Lainnya</Button>
                    </Link>
                  </div>
                </section>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <header className="overflow-hidden rounded-lg border border-[#dfe3ea] border-t-[6px] border-t-primary bg-white p-5 sm:p-6">
                    <h1 className="text-2xl font-bold leading-tight text-[#172033] sm:text-3xl">
                      Formulir Pendaftaran Training
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-[#5f6573] sm:text-[15px]">
                      {training.name}
                    </p>
                    <p className="mt-5 border-t border-[#edf0f4] pt-4 text-xs font-medium text-destructive">
                      * Wajib diisi
                    </p>
                  </header>

                  <section className="rounded-lg border border-[#dfe3ea] bg-white p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-[#172033]">
                      Data Peserta
                    </h2>
                    <div className="mt-5 flex flex-col gap-5">
                      <Input
                        inputId="training-registration-name"
                        label="Nama lengkap"
                        icon={<UserRound className="size-4" />}
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        disabled={submitting}
                        required
                      />
                      <Input
                        inputId="training-registration-email"
                        type="email"
                        label="Email"
                        icon={<Mail className="size-4" />}
                        value={registrant.email}
                        disabled
                      />
                      <Input
                        inputId="training-registration-phone"
                        type="tel"
                        label="Nomor HP"
                        icon={<Phone className="size-4" />}
                        placeholder="Contoh: 081234567890"
                        value={phoneNumber}
                        onChange={(event) => setPhoneNumber(event.target.value)}
                        disabled={submitting}
                        required
                      />
                    </div>
                  </section>

                  <section className="rounded-lg border border-[#dfe3ea] bg-white p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-lg font-bold text-[#172033]">
                        Riwayat Training
                      </h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addHistoryDraft}
                        disabled={submitting}
                        className="shrink-0"
                      >
                        <Plus className="size-4" />
                        Tambah
                      </Button>
                    </div>
                    {historyDrafts.length === 0 ? (
                      <p className="mt-3 text-sm leading-6 text-[#5f6573]">
                        Belum ada riwayat training yang ditambahkan.
                      </p>
                    ) : (
                      <div className="mt-5 flex flex-col gap-7">
                        {historyDrafts.map((draft, index) => (
                          <div
                            key={draft.clientId}
                            className={
                              index > 0
                                ? "border-t border-[#edf0f4] pt-6"
                                : undefined
                            }
                          >
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <h3 className="font-bold text-[#41474e]">
                                Riwayat {index + 1}
                              </h3>
                              <Button
                                variant="ghost"
                                size="iconSm"
                                onClick={() =>
                                  removeHistoryDraft(draft.clientId)
                                }
                                disabled={submitting}
                                className="text-destructive hover:bg-destructive-soft"
                                aria-label={`Hapus riwayat ${index + 1}`}
                                title="Hapus riwayat"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                            <div className="flex flex-col gap-5">
                              <Select
                                selectId={`training-history-level-${draft.clientId}`}
                                label="Tingkat training"
                                placeholder="Pilih tingkat"
                                value={draft.level}
                                onChange={(value) =>
                                  updateHistoryDraft(
                                    draft.clientId,
                                    "level",
                                    value as TrainingStatusEnum
                                  )
                                }
                                options={LEVEL_OPTIONS}
                                disabled={submitting}
                                required
                              />
                              <Input
                                inputId={`training-history-organizer-${draft.clientId}`}
                                label="Penyelenggara"
                                placeholder="Contoh: HMI Cabang Depok"
                                value={draft.organizerName}
                                onChange={(event) =>
                                  updateHistoryDraft(
                                    draft.clientId,
                                    "organizerName",
                                    event.target.value
                                  )
                                }
                                disabled={submitting}
                                required
                              />
                              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                                <Select
                                  selectId={`training-history-result-${draft.clientId}`}
                                  label="Hasil"
                                  placeholder="Pilih hasil"
                                  value={draft.result}
                                  onChange={(value) =>
                                    updateHistoryDraft(
                                      draft.clientId,
                                      "result",
                                      value as TrainingResultEnum
                                    )
                                  }
                                  options={RESULT_OPTIONS}
                                  disabled={submitting}
                                  required
                                />
                                <NumberInput
                                  inputId={`training-history-year-${draft.clientId}`}
                                  label="Tahun"
                                  placeholder="2024"
                                  value={draft.year}
                                  onValueChange={(value) =>
                                    updateHistoryDraft(
                                      draft.clientId,
                                      "year",
                                      value
                                    )
                                  }
                                  characterLength={4}
                                  disabled={submitting}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="rounded-lg border border-[#dfe3ea] bg-white p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-[#172033]">
                      Makalah
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-[#5f6573]">
                      Opsional. Format PDF, DOC, atau DOCX dengan ukuran
                      maksimal 10MB.
                    </p>
                    <input
                      ref={paperInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handlePaperChange}
                    />
                    {paperFile ? (
                      <div className="mt-5 flex items-center gap-3 rounded-lg border border-[#dbe3ef] bg-[#f8f9fb] p-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                          <FileText className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#172033]">
                            {paperFile.name}
                          </p>
                          <p className="mt-0.5 text-xs text-[#7b8190]">
                            {formatFileSize(paperFile.size)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="iconSm"
                          onClick={() => setPaperFile(null)}
                          disabled={submitting}
                          aria-label="Hapus makalah"
                          title="Hapus makalah"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => paperInputRef.current?.click()}
                        disabled={submitting}
                        className="mt-5 flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#bfc7d4] bg-[#fafbfc] px-4 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Upload className="size-5" />
                        Unggah makalah
                      </button>
                    )}
                  </section>

                  {errorMessage && (
                    <p
                      role="alert"
                      className="rounded-lg border border-destructive/20 bg-destructive-soft px-4 py-3 text-sm font-medium text-destructive"
                    >
                      {errorMessage}
                    </p>
                  )}

                  <div className="pb-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={submitting || !training.is_registration_open}
                    >
                      {submitting ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <Send className="size-5" />
                      )}
                      {submitting ? "Mengirim..." : "Kirim Pendaftaran"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </PageMargin>
      </main>
    </TrainingPageShell>
  );
}
