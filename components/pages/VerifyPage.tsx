"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import NumberInput from "../fields/NumberInput";
import RadioButton from "../fields/RadioButton";
import Select from "../fields/Select";
import CreateableSelect, {
  type SearchableOption,
} from "../fields/CreateableSelect";
import SearchableSelect, {
  type SearchableOption as BranchOption,
} from "../fields/SearchableSelect";
import LogoHmi from "../svg/LogoHmi";
import LogoHmiConnect from "../svg/LogoHmiConnect";
import type { Branch } from "@/apis/branches";
import type { Institution } from "@/apis/institutions";
import { verifyUser, type Degree } from "@/lib/actions";

const DEGREE_OPTIONS: { label: string; value: Degree }[] = [
  { label: "Diploma (Ahli Pratama)", value: "diploma_ahli_pratama" },
  { label: "Diploma (Ahli Muda)", value: "diploma_ahli_muda" },
  { label: "Diploma (Ahli Madya)", value: "diploma_ahli_madya" },
  { label: "Sarjana", value: "sarjana" },
  { label: "Magister", value: "magister" },
  { label: "Doktor", value: "doktor" },
];

const TRAINING_LEVELS = [
  { label: "LK1", value: "LK1" },
  { label: "LK2", value: "LK2" },
  { label: "LK3", value: "LK3" },
];

const TRAINING_RESULTS = [
  { label: "Lulus", value: "passed" },
  { label: "Lulus Bersyarat", value: "conditional_pass" },
  { label: "Tidak Lulus", value: "failed" },
];

const STEPS = ["Pendidikan & Cabang", "Jenjang Kaderisasi", "Senior Course"];

type TrainingRow = {
  level: string;
  result: string;
  organizerName: string;
  year: string;
};

function emptyTrainingRow(): TrainingRow {
  return { level: "", result: "", organizerName: "", year: "" };
}

type FormData = {
  institution: SearchableOption | null;
  degree: Degree | null;
  major: string;
  startYear: string;
  endYear: string;
  branch: BranchOption | null;
  trainings: TrainingRow[];
  hasSeniorCourse: boolean | null;
};

function emptyFormData(): FormData {
  return {
    institution: null,
    degree: null,
    major: "",
    startYear: "",
    endYear: "",
    branch: null,
    trainings: [emptyTrainingRow()],
    hasSeniorCourse: null,
  };
}

function DecorativeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-secondary/20 blur-2xl" />
      <div className="absolute -right-10 top-16 h-40 w-40 rounded-full bg-primary/15 blur-2xl" />
      <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-primary/15 blur-2xl" />
      <div className="absolute -bottom-10 left-12 h-32 w-32 rounded-full bg-secondary/15 blur-2xl" />

      <svg
        className="absolute left-6 top-6 h-16 w-16 text-primary/30 sm:left-10 sm:top-10"
        viewBox="0 0 60 60"
        fill="none"
      >
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <circle
              key={`${row}-${col}`}
              cx={8 + col * 16}
              cy={8 + row * 16}
              r="2.5"
              fill="currentColor"
            />
          ))
        )}
      </svg>

      <svg
        className="absolute bottom-10 right-10 h-16 w-28 text-secondary/40 sm:bottom-16 sm:right-16"
        viewBox="0 0 120 60"
        fill="none"
      >
        <path
          d="M2 50C20 10 40 10 60 30C80 50 100 50 118 15"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

interface VerifyPageProps {
  fullName?: string;
  branches: Branch[];
  institutions: Institution[];
}

export default function VerifyPage({
  fullName,
  branches,
  institutions,
}: VerifyPageProps) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState<FormData>(emptyFormData);

  function updateFormData<K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  const institutionOptions: SearchableOption[] = institutions.map((item) => ({
    label: item.name,
    value: item.name,
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
        value: item.name,
        image: item.image_url,
      })),
      hasMore: Boolean(json.hasMore),
    };
  }

  async function createInstitutionOption(
    name: string
  ): Promise<SearchableOption | null> {
    const response = await fetch("/api/institutions/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await response.json();
    const created: Institution | null = json.data ?? null;

    if (!created) return null;
    return {
      label: created.name,
      value: created.name,
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

  function updateTraining(index: number, patch: Partial<TrainingRow>) {
    setFormData((prev) => ({
      ...prev,
      trainings: prev.trainings.map((row, i) =>
        i === index ? { ...row, ...patch } : row
      ),
    }));
  }

  function addTrainingRow() {
    setFormData((prev) => ({
      ...prev,
      trainings: [...prev.trainings, emptyTrainingRow()],
    }));
  }

  function removeTrainingRow(index: number) {
    setFormData((prev) => ({
      ...prev,
      trainings: prev.trainings.filter((_, i) => i !== index),
    }));
  }

  const filledTrainings = formData.trainings.filter(
    (row) => row.level || row.result || row.organizerName || row.year
  );
  const hasIncompleteTraining = filledTrainings.some(
    (row) => !row.level || !row.result || !row.organizerName || !row.year
  );

  const isStep0Valid =
    formData.institution !== null &&
    formData.degree !== null &&
    formData.major.trim() !== "" &&
    formData.startYear.trim() !== "" &&
    formData.endYear.trim() !== "" &&
    formData.branch !== null;
  const isStep1Valid = !hasIncompleteTraining;
  const isStep2Valid = formData.hasSeniorCourse !== null;

  const canGoNext =
    (step === 0 && isStep0Valid) ||
    (step === 1 && isStep1Valid) ||
    (step === 2 && isStep2Valid);

  async function handleSubmit() {
    if (!isStep2Valid) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const result = await verifyUser({
        branch_id: String(formData.branch?.value ?? ""),
        trainings: filledTrainings.map((row) => ({
          level: row.level,
          result: row.result,
          organizer_name: row.organizerName,
          year: Number(row.year),
        })),
        educations: [
          {
            institution_name: formData.institution?.label ?? "",
            degree: formData.degree ?? "",
            major: formData.major,
            start_year: Number(formData.startYear),
            end_year: Number(formData.endYear),
          },
        ],
        has_senior_course: formData.hasSeniorCourse ?? false,
      });

      if (!result.success) {
        console.error("[VerifyPage] verifyUser rejected:", result);
        setErrorMessage(result.message ?? "Verifikasi gagal. Coba lagi.");
        setStatus("error");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("[VerifyPage] verifyUser threw:", err);
      setErrorMessage("Verifikasi gagal. Coba lagi.");
      setStatus("error");
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
                bisa memverifikasi akun HMI Connect kamu.
              </p>
            </div>
          </div>
          <Button
            variant="dark"
            size="lg"
            className="w-full"
            onClick={() => setStarted(true)}
          >
            Mulai Verifikasi
            <ArrowRight className="size-4" />
          </Button>
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

          <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-[#172033]">
                  Kamu berkuliah dimana dan dari cabang mana?
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
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-[#172033]">
                  Jenjang kaderisasi yang sudah dilalui
                </h2>
                <p className="text-sm text-[#5f6573]">
                  Lewati bagian ini kalau kamu belum pernah mengikuti jenjang
                  kaderisasi.
                </p>

                <div className="flex flex-col gap-6">
                  {formData.trainings.map((row, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-3 rounded-xl border border-[#dbe3ef] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#172033]">
                          Jenjang {index + 1}
                        </p>
                        {formData.trainings.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTrainingRow(index)}
                            className="cursor-pointer text-xs font-semibold text-[#b42318]"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        <Select
                          selectId={`training-level-${index}`}
                          label="Level"
                          placeholder="Pilih level"
                          value={row.level || null}
                          onChange={(value) =>
                            updateTraining(index, {
                              level: String(value ?? ""),
                            })
                          }
                          options={TRAINING_LEVELS}
                        />
                        <Select
                          selectId={`training-result-${index}`}
                          label="Hasil"
                          placeholder="Pilih hasil"
                          value={row.result || null}
                          onChange={(value) =>
                            updateTraining(index, {
                              result: String(value ?? ""),
                            })
                          }
                          options={TRAINING_RESULTS}
                        />
                      </div>
                      <Input
                        inputId={`training-organizer-${index}`}
                        label="Penyelenggara"
                        placeholder="Contoh: Panitia Daerah Aceh"
                        value={row.organizerName}
                        onChange={(e) =>
                          updateTraining(index, {
                            organizerName: e.target.value,
                          })
                        }
                      />
                      <NumberInput
                        inputId={`training-year-${index}`}
                        label="Tahun"
                        placeholder="2020"
                        value={row.year}
                        onValueChange={(value) =>
                          updateTraining(index, { year: value })
                        }
                      />
                    </div>
                  ))}
                </div>

                <Button variant="outline" onClick={addTrainingRow}>
                  + Tambah Jenjang Kaderisasi
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-[#172033]">
                  Apakah kamu sudah pernah mengikuti Senior Course?
                </h2>

                <div className="flex flex-col gap-3">
                  <RadioButton
                    radioName="has-senior-course"
                    label="Sudah"
                    value={true}
                    selectedValue={formData.hasSeniorCourse}
                    onChange={(value) =>
                      updateFormData("hasSeniorCourse", value)
                    }
                  />
                  <RadioButton
                    radioName="has-senior-course"
                    label="Belum"
                    value={false}
                    selectedValue={formData.hasSeniorCourse}
                    onChange={(value) =>
                      updateFormData("hasSeniorCourse", value)
                    }
                  />
                </div>

                {status === "error" && (
                  <p className="text-xs font-semibold text-[#b42318]">
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
                  {status === "submitting" ? "Mengirim..." : "Kirim Verifikasi"}
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
