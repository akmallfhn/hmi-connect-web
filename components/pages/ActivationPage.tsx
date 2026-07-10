"use client";

import { ArrowRight, Loader2, ShieldCheck, Upload } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import Input from "../fields/Input";
import NumberInput from "../fields/NumberInput";
import Select from "../fields/Select";
import CreateableSelect, {
  type SearchableOption,
} from "../fields/CreateableSelect";
import DecorativeBackground from "../common/DecorativeBackground";
import LogoHmi from "../svg/LogoHmi";
import LogoHmiConnect from "../svg/LogoHmiConnect";
import type { Institution } from "@/apis/institutions";
import { createInstitution, activateUser, logoutUser } from "@/lib/actions";
import { supabase } from "@/lib/supabase";
import { DEGREE_OPTIONS } from "@/lib/education";
import {
  isSuccessStatus,
  type Degree,
  type StatusName,
  type TrainingResultEnum,
} from "@/lib/types";
import {
  isUsernameFormatValid,
  USERNAME_ERROR,
  USERNAME_PATTERN,
} from "@/lib/username";

const TRAINING_RESULTS: { label: string; value: TrainingResultEnum }[] = [
  { label: "Lulus", value: "passed" },
  { label: "Lulus Bersyarat", value: "conditional_pass" },
  { label: "Tidak Lulus", value: "failed" },
];

const EDUCATION_YEAR_OPTIONS = Array.from(
  { length: 2026 - 1947 + 1 },
  (_, index) => {
    const year = String(2026 - index);
    return { label: year, value: year };
  }
);

const STEPS = ["Profil", "Pendidikan", "Latihan Kader 1"];
const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const ALLOWED_AVATAR_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
type UsernameAvailability =
  | "idle"
  | "checking"
  | "available"
  | "unavailable"
  | "error";

type FormData = {
  avatar: string;
  fullName: string;
  username: string;
  institution: SearchableOption | null;
  degree: Degree | null;
  major: string;
  startYear: string;
  endYear: string;
  trainingResult: TrainingResultEnum | null;
  trainingOrganizerName: string;
  trainingYear: string;
};

function emptyFormData(fullName?: string, avatar?: string): FormData {
  return {
    avatar: avatar ?? "",
    fullName: fullName ?? "",
    username: "",
    institution: null,
    degree: null,
    major: "",
    startYear: "",
    endYear: "",
    trainingResult: null,
    trainingOrganizerName: "",
    trainingYear: "",
  };
}

interface ActivationPageProps {
  userId?: string;
  fullName?: string;
  avatar?: string;
  institutions: Institution[];
}

export default function ActivationPage({
  userId,
  fullName,
  avatar,
  institutions,
}: ActivationPageProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [usernameApiError, setUsernameApiError] = useState("");
  const [usernameAvailability, setUsernameAvailability] =
    useState<UsernameAvailability>("idle");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch (err) {
      console.error("[ActivationPage] logoutUser threw:", err);
    } finally {
      window.location.href = "/auth/login";
    }
  }

  const [formData, setFormData] = useState<FormData>(() =>
    emptyFormData(fullName, avatar)
  );
  const usernameHasValidFormat = isUsernameFormatValid(formData.username);

  useEffect(() => {
    if (!usernameHasValidFormat) return;

    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/users/check-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: formData.username.trim() }),
          signal: controller.signal,
        });
        const result = (await response.json()) as {
          status?: StatusName;
          data?: { is_available?: boolean };
        };

        if (
          !response.ok ||
          !isSuccessStatus(result.status) ||
          typeof result.data?.is_available !== "boolean"
        ) {
          setUsernameAvailability("error");
          return;
        }

        setUsernameAvailability(
          result.data.is_available ? "available" : "unavailable"
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("[ActivationPage] check username threw:", err);
        setUsernameAvailability("error");
      }
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [formData.username, usernameHasValidFormat]);

  function updateFormData<K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Ukuran foto maksimal 2MB.");
      return;
    }
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error("Format hanya boleh JPG, PNG, WEBP, atau AVIF.");
      return;
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (
      !fileExtension ||
      !ALLOWED_AVATAR_EXTENSIONS.includes(fileExtension)
    ) {
      toast.error("Ekstensi file tidak valid.");
      return;
    }

    const ownerKey = userId ?? crypto.randomUUID();
    const filePath = `avatars/${ownerKey}-${Date.now()}.${fileExtension}`;

    setUploadingAvatar(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from("hmi-connect")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("[ActivationPage] avatar upload failed:", uploadError);
        toast.error("Gagal mengunggah foto. Coba lagi.");
        return;
      }

      const { data } = supabase.storage
        .from("hmi-connect")
        .getPublicUrl(filePath);

      if (!data.publicUrl) {
        toast.error("Gagal mendapatkan URL foto.");
        return;
      }

      updateFormData("avatar", data.publicUrl);
      toast.success("Foto profil berhasil diunggah.");
    } catch (err) {
      console.error("[ActivationPage] avatar upload threw:", err);
      toast.error("Gagal mengunggah foto. Coba lagi.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  const institutionOptions: SearchableOption[] = institutions.map((item) => ({
    label: item.name,
    value: item.id,
    image: item.image_url,
  }));
  async function loadInstitutionOptions(inputValue: string, page: number) {
    const params = new URLSearchParams({ page: String(page) });
    if (inputValue) params.set("q", inputValue);

    const response = await fetch(`/api/institutions/search?${params}`);
    const json = await response.json();
    const results: Institution[] = json.data ?? [];

    return {
      options: results.map((item) => ({
        label: item.name,
        value: item.id,
        image: item.image_url,
      })),
      hasMore: Boolean(json.hasMore),
    };
  }

  async function createInstitutionOption(
    name: string
  ): Promise<SearchableOption | null> {
    const created = await createInstitution(name);

    if (!created) return null;
    return {
      label: created.name,
      value: created.id,
      image: created.image_url,
    };
  }

  const isProfileStepValid =
    formData.fullName.trim() !== "" &&
    usernameHasValidFormat &&
    usernameAvailability === "available";

  const isEducationStepValid =
    formData.institution !== null &&
    formData.degree !== null &&
    formData.major.trim() !== "" &&
    formData.startYear.trim() !== "" &&
    formData.endYear.trim() !== "";

  const isTrainingStepValid =
    formData.trainingResult !== null &&
    formData.trainingOrganizerName.trim() !== "" &&
    formData.trainingYear.trim() !== "";

  const canGoNext =
    ((step === 0 && isProfileStepValid) ||
      (step === 1 && isEducationStepValid) ||
      (step === 2 && isTrainingStepValid)) &&
    !uploadingAvatar;

  async function handleSubmit() {
    if (!isProfileStepValid || !isEducationStepValid || !isTrainingStepValid) {
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const result = await activateUser({
        username: formData.username.trim(),
        full_name: formData.fullName.trim(),
        ...(formData.avatar ? { avatar: formData.avatar } : {}),
        training_result: formData.trainingResult as TrainingResultEnum,
        training_organizer_name: formData.trainingOrganizerName,
        training_year: Number(formData.trainingYear),
        education_institution_id: Number(formData.institution?.value ?? 0),
        education_degree: formData.degree as Degree,
        education_major: formData.major,
        education_start_year: Number(formData.startYear),
        education_end_year: Number(formData.endYear),
      });

      if (!isSuccessStatus(result.status)) {
        console.error("[ActivationPage] activateUser rejected:", result);
        const isUsernameConflict = result.status === "CONFLICT";
        const message = isUsernameConflict
          ? "Username ini sudah digunakan. Silakan pilih username lain."
          : result.message ?? "Aktivasi gagal. Coba lagi.";
        if (isUsernameConflict) {
          setUsernameApiError(message);
          setUsernameAvailability("unavailable");
          setStep(0);
        }
        setErrorMessage(message);
        setStatus("error");
        toast.error(message);
        return;
      }

      window.location.href = "/";
    } catch (err) {
      console.error("[ActivationPage] activateUser threw:", err);
      setErrorMessage("Aktivasi gagal. Coba lagi.");
      setStatus("error");
      toast.error("Aktivasi gagal. Coba lagi.", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  if (!started) {
    return (
      <main className="relative flex min-h-screen flex-col overflow-hidden bg-white lg:items-center lg:justify-center lg:bg-[#f7fbfa] lg:px-5 lg:py-12">
        <div className="hidden lg:block">
          <DecorativeBackground />
        </div>
        <div className="relative flex flex-1 flex-col items-center gap-6 p-6 pb-12 text-center lg:flex-none lg:w-full lg:max-w-md lg:rounded-3xl lg:bg-white lg:p-10 lg:shadow-xl">
          <div className="flex flex-1 flex-col items-center justify-center gap-6 lg:flex-none">
            <LogoHmiConnect className="h-16 w-auto" />
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
                Halo, {fullName ?? "Kader"}!
              </h1>
              <p className="text-[15px] leading-6 text-[#5f6573]">
                Sebelum lanjut, lengkapi dulu data keanggotaan kamu supaya kami
                bisa mengaktifkan akun HMI Connect kamu.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col items-center gap-4">
            <Button
              variant="dark"
              size="lg"
              className="w-full"
              onClick={() => setStarted(true)}
            >
              Mulai Aktivasi
              <ArrowRight className="size-4" />
            </Button>
            <span
              onClick={loggingOut ? undefined : handleLogout}
              className={`text-sm font-medium text-destructive underline underline-offset-2 ${
                loggingOut
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:text-destructive-foreground"
              }`}
            >
              {loggingOut ? "Keluar..." : "Keluar"}
            </span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white lg:flex lg:items-center lg:justify-center lg:bg-[#f7fbfa] lg:px-5 lg:py-12">
      <div className="hidden lg:block">
        <DecorativeBackground />
      </div>
      <div className="relative flex w-full flex-col lg:h-[620px] lg:max-w-4xl lg:flex-row lg:overflow-hidden lg:rounded-3xl lg:bg-white lg:shadow-xl">
        <div className="relative hidden w-[320px] shrink-0 flex-col justify-between overflow-hidden bg-primary-soft p-10 lg:flex">
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <LogoHmi className="h-24 w-auto" />
              <LogoHmiConnect className="h-16 w-auto" />
            </div>
            <h2 className="text-2xl font-bold leading-snug text-[#172033]">
              Langkah awal perjalanan di HMI
            </h2>
            <div className="h-1 w-10 rounded-full bg-secondary" />
            <p className="text-[15px] leading-6 text-[#5f6573]">
              Terhubung, bertumbuh, dan berdampak bersama HMI.
            </p>
          </div>

          <svg
            className="pointer-events-none absolute bottom-8 right-6 h-16 w-16 text-secondary/40"
            viewBox="0 0 60 60"
            fill="none"
          >
            <path
              d="M2 30C15 5 30 5 30 30C30 55 45 55 58 30"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="flex w-full flex-col gap-6 p-6 sm:p-10 lg:h-full lg:overflow-hidden">
          <div className="shrink-0 flex flex-col gap-2">
            <div className="flex gap-2">
              {STEPS.map((label, index) => (
                <div
                  key={label}
                  className={`h-1.5 flex-1 rounded-full ${
                    index <= step ? "bg-primary" : "bg-[#e6e9ef]"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:p-1">
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#172033]">
                    Lengkapi profil kamu
                  </h2>
                  <p className="mt-1 text-sm text-[#5f6573]">
                    Kamu bisa menyesuaikan foto dan nama dari akun Google kamu.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3 rounded-2xl bg-[#f7fbfa] p-5">
                  <Avatar
                    src={formData.avatar}
                    name={formData.fullName || "Kader"}
                    size={104}
                    ring
                  />
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.avif"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    {uploadingAvatar
                      ? "Mengunggah..."
                      : formData.avatar
                        ? "Ganti Foto"
                        : "Unggah Foto"}
                  </Button>
                  <p className="text-center text-xs text-[#5f6573]">
                    JPG, PNG, WEBP, atau AVIF. Maksimal 2MB.
                  </p>
                </div>

                <Input
                  inputId="full-name"
                  label="Nama Lengkap"
                  placeholder="Masukkan nama lengkap"
                  value={formData.fullName}
                  onChange={(event) =>
                    updateFormData("fullName", event.target.value)
                  }
                  required
                />
                <Input
                  inputId="username"
                  label="Username"
                  placeholder="Contoh: akmal.fhn"
                  value={formData.username}
                  onChange={(event) => {
                    const nextUsername = event.target.value;
                    const hasValidFormat = isUsernameFormatValid(nextUsername);
                    setUsernameApiError("");
                    setUsernameAvailability(
                      hasValidFormat ? "checking" : "idle"
                    );
                    updateFormData("username", nextUsername);
                  }}
                  pattern={USERNAME_PATTERN}
                  patternErrorMessage={USERNAME_ERROR}
                  errorMessage={usernameApiError}
                  autoCapitalize="none"
                  autoComplete="username"
                  spellCheck={false}
                  required
                />
                {usernameAvailability === "checking" && (
                  <p className="-mt-2 pl-1 text-xs text-[#5f6573]">
                    Memeriksa ketersediaan username...
                  </p>
                )}
                {usernameAvailability === "available" && (
                  <p className="-mt-2 pl-1 text-xs font-medium text-primary">
                    Username tersedia.
                  </p>
                )}
                {usernameAvailability === "unavailable" &&
                  !usernameApiError && (
                    <p className="-mt-2 pl-1 text-xs text-destructive">
                      Username sudah digunakan. Silakan pilih username lain.
                    </p>
                  )}
                {usernameAvailability === "error" && (
                  <p className="-mt-2 pl-1 text-xs text-destructive">
                    Ketersediaan username gagal diperiksa. Coba lagi.
                  </p>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-[#172033]">
                  Kamu berkuliah dimana?
                </h2>

                <CreateableSelect
                  selectId="institution"
                  label="Universitas"
                  placeholder="Cari universitas..."
                  value={formData.institution}
                  onChange={(option) => updateFormData("institution", option)}
                  loadOptions={loadInstitutionOptions}
                  defaultOptions={institutionOptions}
                  onCreateOption={createInstitutionOption}
                  createLabel={(input) => `Tambah universitas "${input}"`}
                  debounceMs={400}
                  required
                />
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <Input
                    inputId="major"
                    label="Jurusan"
                    placeholder="Contoh: Teknik Informatika"
                    value={formData.major}
                    onChange={(e) => updateFormData("major", e.target.value)}
                    required
                  />
                  <Select
                    selectId="degree"
                    label="Jenjang Pendidikan"
                    placeholder="Pilih jenjang"
                    value={formData.degree}
                    onChange={(value) =>
                      updateFormData("degree", value as Degree | null)
                    }
                    options={DEGREE_OPTIONS}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <Select
                    selectId="start-year"
                    label="Tahun Masuk"
                    placeholder="Pilih tahun masuk"
                    value={formData.startYear}
                    onChange={(value) =>
                      updateFormData("startYear", String(value ?? ""))
                    }
                    options={EDUCATION_YEAR_OPTIONS}
                    required
                  />
                  <Select
                    selectId="end-year"
                    label="Tahun Keluar"
                    placeholder="Pilih tahun keluar"
                    value={formData.endYear}
                    onChange={(value) =>
                      updateFormData("endYear", String(value ?? ""))
                    }
                    options={EDUCATION_YEAR_OPTIONS}
                    required
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-[#172033]">
                  Riwayat Latihan Kader 1
                </h2>
                <p className="text-sm text-[#5f6573]">
                  Latihan Kader 1 adalah syarat minimal untuk mengaktifkan
                  akun HMI Connect kamu.
                </p>

                <Select
                  selectId="training-result"
                  label="Hasil"
                  placeholder="Pilih hasil"
                  value={formData.trainingResult}
                  onChange={(value) =>
                    updateFormData(
                      "trainingResult",
                      value as TrainingResultEnum | null
                    )
                  }
                  options={TRAINING_RESULTS}
                  required
                />
                <Input
                  inputId="training-organizer"
                  label="Penyelenggara"
                  placeholder="Contoh: Komisariat FH UI"
                  value={formData.trainingOrganizerName}
                  onChange={(e) =>
                    updateFormData("trainingOrganizerName", e.target.value)
                  }
                  required
                />
                <NumberInput
                  inputId="training-year"
                  label="Tahun"
                  placeholder="2020"
                  value={formData.trainingYear}
                  onValueChange={(value) =>
                    updateFormData("trainingYear", value)
                  }
                  required
                />

                {status === "error" && (
                  <p className="text-xs font-semibold text-destructive">
                    {errorMessage}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 flex flex-col gap-4">
            <div className="flex gap-3">
              {step > 0 && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep((s) => s - 1)}
                  disabled={status === "submitting"}
                >
                  Kembali
                </Button>
              )}

              {step < STEPS.length - 1 ? (
                <Button
                  variant="dark"
                  className="flex-1"
                  disabled={!canGoNext}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Lanjut
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button
                  variant="dark"
                  className="flex-1"
                  disabled={!canGoNext || status === "submitting"}
                  onClick={handleSubmit}
                >
                  {status === "submitting" ? "Mengirim..." : "Aktivasi Akun"}
                </Button>
              )}
            </div>

            <p className="flex items-center justify-center gap-1.5 text-xs text-[#5f6573]">
              <ShieldCheck className="size-3.5 text-primary" />
              Data yang kamu isi aman dan hanya digunakan untuk keperluan
              internal HMI.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
