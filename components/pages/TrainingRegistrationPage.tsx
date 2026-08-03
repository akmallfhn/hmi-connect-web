"use client";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  MapPin,
  Send,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { TrainingDetail } from "@/apis/trainings";
import { registerTraining } from "@/lib/actions";
import { formatTrainingDateRange } from "@/lib/trainings/training-ui";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import PageMargin from "../common/PageMargin";
import Input from "../fields/Input";
import { TrainingLevelLabel } from "../trainings/TrainingLabels";
import TrainingPageShell, {
  type TrainingViewer,
} from "../trainings/TrainingPageShell";

interface TrainingRegistrationPageProps {
  viewer: TrainingViewer;
  training: TrainingDetail;
}

export default function TrainingRegistrationPage({
  viewer,
  training,
}: TrainingRegistrationPageProps) {
  const [paperUrl, setPaperUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const result = await registerTraining({
        training_id: training.id,
        ...(paperUrl.trim() ? { paper_url: paperUrl.trim() } : {}),
      });

      if (!isSuccessStatus(result.status)) {
        const message =
          result.status === "CONFLICT"
            ? "Kamu sudah terdaftar pada training ini."
            : result.status === "UNAUTHORIZED"
              ? "Sesi berakhir. Silakan masuk kembali."
              : result.message || "Pendaftaran training gagal diproses.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      setRegistered(true);
      toast.success("Pendaftaran training berhasil.");
    } catch (error) {
      console.error("[TrainingRegistrationPage] register threw:", error);
      const message = "Pendaftaran training gagal diproses.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <TrainingPageShell viewer={viewer} mobileBackTitle="Pendaftaran Training">
      <main className="bg-white">
        <PageMargin className="py-5 lg:py-8">
          <Link
            href={`/trainings/${training.id}`}
            className="hidden items-center gap-2 text-sm font-semibold text-[#5f6573] transition hover:text-primary lg:inline-flex"
          >
            <ArrowLeft className="size-4" />
            Kembali ke detail training
          </Link>

          <div className="mt-5 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
            <section className="min-w-0">
              <div className="flex items-center gap-2">
                <TrainingLevelLabel level={training.level} />
              </div>
              <h1 className="mt-3 text-2xl font-bold text-[#172033] sm:text-3xl">
                Pendaftaran Training
              </h1>
              <p className="mt-1.5 text-sm text-[#5f6573] sm:text-base">
                {training.name}
              </p>

              {registered ? (
                <div className="mt-7 flex min-h-80 flex-col items-center justify-center border-y border-[#c8e6e7] bg-primary-soft/60 px-5 text-center">
                  <CheckCircle2 className="size-12 text-primary" />
                  <h2 className="mt-4 text-xl font-bold text-[#172033]">
                    Pendaftaran Berhasil
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#5f6573]">
                    Data pendaftaranmu telah tercatat sebagai peserta {training.name}.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <Link href={`/trainings/${training.id}`}>
                      <Button variant="outline">Lihat Detail</Button>
                    </Link>
                    <Link href="/trainings">
                      <Button>Daftar Training Lain</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="mt-7 rounded-lg border border-[#e1e5ec] bg-white p-5 sm:p-6"
                >
                  <div className="border-b border-[#edf0f4] pb-5">
                    <p className="text-xs font-semibold uppercase text-[#7b8190]">
                      Peserta
                    </p>
                    <p className="mt-1 text-base font-bold text-[#172033]">
                      {viewer.fullName ?? "Kader HMI"}
                    </p>
                    {viewer.branchName && (
                      <p className="mt-1 text-sm text-[#5f6573]">
                        HMI Cabang {viewer.branchName}
                      </p>
                    )}
                  </div>

                  <div className="mt-5">
                    <Input
                      inputId="training-paper-url"
                      type="url"
                      label="Tautan Makalah (opsional)"
                      icon={<FileText className="size-4" />}
                      placeholder="https://..."
                      value={paperUrl}
                      onChange={(event) => setPaperUrl(event.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  {errorMessage && (
                    <p
                      role="alert"
                      className="mt-4 rounded-lg bg-destructive-soft px-3 py-2.5 text-sm font-medium text-destructive"
                    >
                      {errorMessage}
                    </p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="mt-6 w-full"
                    disabled={submitting}
                  >
                    <Send className="size-5" />
                    {submitting ? "Mendaftarkan..." : "Kirim Pendaftaran"}
                  </Button>
                </form>
              )}
            </section>

            <aside className="border-t border-[#e1e5ec] pt-6 lg:sticky lg:top-24 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="flex gap-4">
                <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-lg bg-[#edf1f6]">
                  {training.image_url ? (
                    <Image
                      src={training.image_url}
                      alt={`Poster ${training.name}`}
                      fill
                      sizes="96px"
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-[#a0a6b2]">
                      <FileText className="size-7" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-5 text-[#172033]">
                    {training.name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-[#5f6573]">
                    {training.organizer_name ?? "Penyelenggara belum tersedia"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 border-t border-[#edf0f4] pt-5 text-sm">
                <div className="flex gap-3 text-[#41474e]">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-secondary" />
                  <span>
                    {formatTrainingDateRange(
                      training.start_date,
                      training.end_date
                    )}
                  </span>
                </div>
                <div className="flex gap-3 text-[#41474e]">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[#42359B]" />
                  <span>{training.location_name ?? "Lokasi belum ditentukan"}</span>
                </div>
                <div className="flex gap-3 text-[#41474e]">
                  <Building2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    {training.organizer_name ?? "Penyelenggara belum tersedia"}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </PageMargin>
      </main>
    </TrainingPageShell>
  );
}
