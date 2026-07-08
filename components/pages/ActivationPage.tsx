"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import NumberInput from "../fields/NumberInput";
import Select from "../fields/Select";
import CreateableSelect, {
  type SearchableOption,
} from "../fields/CreateableSelect";
import SearchableSelect, {
  type SearchableOption as BranchOption,
} from "../fields/SearchableSelect";
import DecorativeBackground from "../common/DecorativeBackground";
import LogoHmi from "../svg/LogoHmi";
import LogoHmiConnect from "../svg/LogoHmiConnect";
import type { Branch } from "@/apis/branches";
import type { Institution } from "@/apis/institutions";
import { createInstitution, activateUser, logoutUser } from "@/lib/actions";
import {
  isSuccessStatus,
  type Degree,
  type TrainingResultEnum,
} from "@/lib/types";

const DEGREE_OPTIONS: { label: string; value: Degree }[] = [
  { label: "Diploma (Ahli Pratama)", value: "diploma_ahli_pratama" },
  { label: "Diploma (Ahli Muda)", value: "diploma_ahli_muda" },
  { label: "Diploma (Ahli Madya)", value: "diploma_ahli_madya" },
  { label: "Sarjana", value: "sarjana" },
  { label: "Magister", value: "magister" },
  { label: "Doktor", value: "doktor" },
];

const TRAINING_RESULTS: { label: string; value: TrainingResultEnum }[] = [
  { label: "Lulus", value: "passed" },
  { label: "Lulus Bersyarat", value: "conditional_pass" },
  { label: "Tidak Lulus", value: "failed" },
];

const STEPS = ["Pendidikan & Cabang", "Latihan Kader 1"];

type FormData = {
  institution: SearchableOption | null;
  degree: Degree | null;
  major: string;
  startYear: string;
  endYear: string;
  branch: BranchOption | null;
  trainingResult: TrainingResultEnum | null;
  trainingOrganizerName: string;
  trainingYear: string;
};

function emptyFormData(): FormData {
  return {
    institution: null,
    degree: null,
    major: "",
    startYear: "",
    endYear: "",
    branch: null,
    trainingResult: null,
    trainingOrganizerName: "",
    trainingYear: "",
  };
}

interface ActivationPageProps {
  fullName?: string;
  branches: Branch[];
  institutions: Institution[];
}

export default function ActivationPage({
  fullName,
  branches,
  institutions,
}: ActivationPageProps) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
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

  const [formData, setFormData] = useState<FormData>(emptyFormData);

  function updateFormData<K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  const institutionOptions: SearchableOption[] = institutions.map((item) => ({
    label: item.name,
    value: item.id,
    image: item.image_url,
  }));
  const branchOptions: BranchOption[] = branches.map((item) => ({
    label: item.name,
    value: item.id,
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

  async function loadBranchOptions(inputValue: string, page: number) {
    const params = new URLSearchParams({ page: String(page) });
    if (inputValue) params.set("q", inputValue);

    const response = await fetch(`/api/branches/search?${params}`);
    const json = await response.json();
    const results: Branch[] = json.data ?? [];

    return {
      options: results.map((item) => ({ label: item.name, value: item.id })),
      hasMore: Boolean(json.hasMore),
    };
  }

  const isStep0Valid =
    formData.institution !== null &&
    formData.degree !== null &&
    formData.major.trim() !== "" &&
    formData.startYear.trim() !== "" &&
    formData.endYear.trim() !== "";

  const isStep1Valid =
    formData.trainingResult !== null &&
    formData.trainingOrganizerName.trim() !== "" &&
    formData.trainingYear.trim() !== "" &&
    formData.branch !== null;

  const canGoNext =
    (step === 0 && isStep0Valid) || (step === 1 && isStep1Valid);

  async function handleSubmit() {
    if (!isStep1Valid) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const result = await activateUser({
        branch_id: String(formData.branch?.value ?? ""),
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
        const message = result.message ?? "Aktivasi gagal. Coba lagi.";
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

          <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-1">
            {step === 0 && (
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
                  <NumberInput
                    inputId="start-year"
                    label="Tahun Masuk"
                    placeholder="2020"
                    value={formData.startYear}
                    onValueChange={(value) =>
                      updateFormData("startYear", value)
                    }
                    required
                  />
                  <NumberInput
                    inputId="end-year"
                    label="Tahun Lulus (Perkiraan)"
                    placeholder="2024"
                    value={formData.endYear}
                    onValueChange={(value) => updateFormData("endYear", value)}
                    required
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-[#172033]">
                  Riwayat Latihan Kader 1
                </h2>
                <p className="text-sm text-[#5f6573]">
                  Latihan Kader 1 adalah syarat minimal untuk mengaktifkan
                  akun HMI Connect kamu.
                </p>

                <SearchableSelect
                  selectId="branch"
                  label="Cabang HMI"
                  placeholder="Cari cabang..."
                  value={formData.branch}
                  onChange={(option) => updateFormData("branch", option)}
                  loadOptions={loadBranchOptions}
                  defaultOptions={branchOptions}
                  debounceMs={400}
                  required
                />

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
