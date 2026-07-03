"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import Select from "../fields/Select";
import SearchableSelect, {
  type SearchableOption,
} from "../fields/SearchableSelect";
import LogoHmiConnect from "../svg/LogoHmiConnect";
import type { Branch } from "@/apis/branches";
import type { Institution } from "@/apis/institutions";
import { verifyUser } from "@/lib/actions";

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

  const [institutionOption, setInstitutionOption] =
    useState<SearchableOption | null>(null);
  const [major, setMajor] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [branchId, setBranchId] = useState<string | number | null>(null);
  const [trainings, setTrainings] = useState<TrainingRow[]>([
    emptyTrainingRow(),
  ]);
  const [hasSeniorCourse, setHasSeniorCourse] = useState<boolean | null>(null);

  const institutionOptions: SearchableOption[] = institutions.map((item) => ({
    label: item.name,
    value: item.name,
  }));
  const branchOptions = branches.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  async function loadInstitutionOptions(
    inputValue: string
  ): Promise<SearchableOption[]> {
    const response = await fetch(
      `/api/institutions/search?q=${encodeURIComponent(inputValue)}`
    );
    const json = await response.json();
    const results: Institution[] = json.data ?? [];

    return results.map((item) => ({ label: item.name, value: item.name }));
  }

  function updateTraining(index: number, patch: Partial<TrainingRow>) {
    setTrainings((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  function addTrainingRow() {
    setTrainings((rows) => [...rows, emptyTrainingRow()]);
  }

  function removeTrainingRow(index: number) {
    setTrainings((rows) => rows.filter((_, i) => i !== index));
  }

  const filledTrainings = trainings.filter(
    (row) => row.level || row.result || row.organizerName || row.year
  );
  const hasIncompleteTraining = filledTrainings.some(
    (row) => !row.level || !row.result || !row.organizerName || !row.year
  );

  const isStep0Valid =
    institutionOption !== null &&
    major.trim() !== "" &&
    startYear.trim() !== "" &&
    endYear.trim() !== "" &&
    branchId !== null;
  const isStep1Valid = !hasIncompleteTraining;
  const isStep2Valid = hasSeniorCourse !== null;

  const canGoNext =
    (step === 0 && isStep0Valid) ||
    (step === 1 && isStep1Valid) ||
    (step === 2 && isStep2Valid);

  async function handleSubmit() {
    if (!isStep2Valid) return;

    setStatus("submitting");
    setErrorMessage("");

    const result = await verifyUser({
      branch_id: String(branchId),
      trainings: filledTrainings.map((row) => ({
        level: row.level,
        result: row.result,
        organizer_name: row.organizerName,
        year: Number(row.year),
      })),
      educations: [
        {
          institution_name: institutionOption?.label ?? "",
          major,
          start_year: Number(startYear),
          end_year: Number(endYear),
        },
      ],
      has_senior_course: hasSeniorCourse ?? false,
    });

    if (!result.success) {
      setErrorMessage(result.message ?? "Verifikasi gagal. Coba lagi.");
      setStatus("error");
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (!started) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-5 text-center">
        <LogoHmiConnect className="h-14 w-auto" />
        <div className="flex max-w-md flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
            Halo, {fullName ?? "Kader"}!
          </h1>
          <p className="text-sm leading-6 text-[#5f6573]">
            Sebelum lanjut, lengkapi dulu data keanggotaan kamu supaya kami bisa
            memverifikasi akun HMI Connect kamu.
          </p>
        </div>
        <Button variant="dark" size="lg" onClick={() => setStarted(true)}>
          Mulai Verifikasi
        </Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-white px-5 py-12">
      <div className="flex w-full max-w-xl flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {STEPS.map((label, index) => (
              <div
                key={label}
                className={`h-1.5 flex-1 rounded-full ${
                  index <= step ? "bg-[#0b8f6a]" : "bg-[#e6e9ef]"
                }`}
              />
            ))}
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f6573]">
            Langkah {step + 1} dari {STEPS.length} — {STEPS[step]}
          </p>
        </div>

        {step === 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-[#172033]">
              Kamu berkuliah dimana dan dari cabang mana?
            </h2>

            <SearchableSelect
              selectId="institution"
              label="Universitas"
              placeholder="Cari universitas..."
              value={institutionOption}
              onChange={setInstitutionOption}
              loadOptions={loadInstitutionOptions}
              defaultOptions={institutionOptions}
              debounceMs={400}
              required
            />
            <Input
              inputId="major"
              label="Jurusan"
              placeholder="Contoh: Teknik Informatika"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                inputId="start-year"
                label="Tahun Masuk"
                type="number"
                placeholder="2020"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                required
              />
              <Input
                inputId="end-year"
                label="Tahun Lulus (Perkiraan)"
                type="number"
                placeholder="2024"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                required
              />
            </div>
            <Select
              selectId="branch"
              label="Cabang HMI"
              placeholder="Pilih cabang"
              value={branchId}
              onChange={(value) => setBranchId(value)}
              options={branchOptions}
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
              {trainings.map((row, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-xl border border-[#dbe3ef] p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#172033]">
                      Jenjang {index + 1}
                    </p>
                    {trainings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTrainingRow(index)}
                        className="cursor-pointer text-xs font-semibold text-[#b42318]"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      selectId={`training-level-${index}`}
                      label="Level"
                      placeholder="Pilih level"
                      value={row.level || null}
                      onChange={(value) =>
                        updateTraining(index, { level: String(value ?? "") })
                      }
                      options={TRAINING_LEVELS}
                    />
                    <Select
                      selectId={`training-result-${index}`}
                      label="Hasil"
                      placeholder="Pilih hasil"
                      value={row.result || null}
                      onChange={(value) =>
                        updateTraining(index, { result: String(value ?? "") })
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
                      updateTraining(index, { organizerName: e.target.value })
                    }
                  />
                  <Input
                    inputId={`training-year-${index}`}
                    label="Tahun"
                    type="number"
                    placeholder="2020"
                    value={row.year}
                    onChange={(e) =>
                      updateTraining(index, { year: e.target.value })
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

            <div className="flex gap-3">
              <Button
                variant={hasSeniorCourse === true ? "primary" : "outline"}
                className="flex-1"
                onClick={() => setHasSeniorCourse(true)}
              >
                Sudah
              </Button>
              <Button
                variant={hasSeniorCourse === false ? "primary" : "outline"}
                className="flex-1"
                onClick={() => setHasSeniorCourse(false)}
              >
                Belum
              </Button>
            </div>

            {status === "error" && (
              <p className="text-xs font-semibold text-[#b42318]">
                {errorMessage}
              </p>
            )}
          </div>
        )}

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
      </div>
    </main>
  );
}
