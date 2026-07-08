"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import DecorativeBackground from "../common/DecorativeBackground";
import Input from "../fields/Input";
import NumberInput from "../fields/NumberInput";
import RadioButton from "../fields/RadioButton";
import SearchableSelect, {
  type SearchableOption,
} from "../fields/SearchableSelect";
import LogoHmi from "../svg/LogoHmi";
import LogoHmiConnect from "../svg/LogoHmiConnect";
import type { Province } from "@/apis/locations";
import { verifyUser } from "@/lib/actions";
import { isSuccessStatus, type GenderEnum } from "@/lib/types";

const STEPS = ["Data KTP", "Alamat"];

type FormData = {
  ktpFullName: string;
  nik: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: GenderEnum | null;
  addressStreet: string;
  province: SearchableOption | null;
  city: SearchableOption | null;
  district: SearchableOption | null;
};

function emptyFormData(): FormData {
  return {
    ktpFullName: "",
    nik: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: null,
    addressStreet: "",
    province: null,
    city: null,
    district: null,
  };
}

interface VerificationPageProps {
  provinces: Province[];
}

export default function VerificationPage({
  provinces,
}: VerificationPageProps) {
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

  function handleProvinceChange(option: SearchableOption | null) {
    setFormData((prev) => ({
      ...prev,
      province: option,
      city: null,
      district: null,
    }));
  }

  function handleCityChange(option: SearchableOption | null) {
    setFormData((prev) => ({ ...prev, city: option, district: null }));
  }

  const provinceOptions: SearchableOption[] = provinces.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  async function loadProvinceOptions(inputValue: string, page: number) {
    const params = new URLSearchParams({ page: String(page) });
    if (inputValue) params.set("q", inputValue);

    const response = await fetch(`/api/provinces/search?${params}`);
    const json = await response.json();
    const results: Province[] = json.data ?? [];

    return {
      options: results.map((item) => ({ label: item.name, value: item.id })),
      hasMore: Boolean(json.hasMore),
    };
  }

  async function loadCityOptions(inputValue: string, page: number) {
    if (!formData.province) return { options: [], hasMore: false };

    const params = new URLSearchParams({
      page: String(page),
      province_id: String(formData.province.value),
    });
    if (inputValue) params.set("q", inputValue);

    const response = await fetch(`/api/cities/search?${params}`);
    const json = await response.json();
    const results: { id: number; name: string }[] = json.data ?? [];

    return {
      options: results.map((item) => ({ label: item.name, value: item.id })),
      hasMore: Boolean(json.hasMore),
    };
  }

  async function loadDistrictOptions(inputValue: string, page: number) {
    if (!formData.city) return { options: [], hasMore: false };

    const params = new URLSearchParams({
      page: String(page),
      city_id: String(formData.city.value),
    });
    if (inputValue) params.set("q", inputValue);

    const response = await fetch(`/api/districts/search?${params}`);
    const json = await response.json();
    const results: { id: number; name: string }[] = json.data ?? [];

    return {
      options: results.map((item) => ({ label: item.name, value: item.id })),
      hasMore: Boolean(json.hasMore),
    };
  }

  const isStep0Valid =
    formData.ktpFullName.trim() !== "" &&
    formData.nik.length === 16 &&
    formData.phoneNumber.trim() !== "" &&
    formData.dateOfBirth.trim() !== "" &&
    formData.gender !== null;

  const isStep1Valid =
    formData.addressStreet.trim() !== "" &&
    formData.province !== null &&
    formData.city !== null &&
    formData.district !== null;

  const canGoNext =
    (step === 0 && isStep0Valid) || (step === 1 && isStep1Valid);

  async function handleSubmit() {
    if (!isStep1Valid) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const result = await verifyUser({
        ktp_full_name: formData.ktpFullName,
        nik: formData.nik,
        phone_number: formData.phoneNumber,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender as GenderEnum,
        address_street: formData.addressStreet,
        district_id: Number(formData.district?.value ?? 0),
      });

      if (!isSuccessStatus(result.status)) {
        console.error("[VerificationPage] verifyUser rejected:", result);
        const message =
          result.status === "CONFLICT"
            ? "NIK ini sudah terverifikasi di akun lain. Hubungi admin HMI Connect jika ini keliru."
            : result.message ?? "Verifikasi gagal. Coba lagi.";
        setErrorMessage(message);
        setStatus("error");
        toast.error(message);
        return;
      }

      toast.success("Verifikasi berhasil! Akun kamu sudah terverifikasi.");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err) {
      console.error("[VerificationPage] verifyUser threw:", err);
      setErrorMessage("Verifikasi gagal. Coba lagi.");
      setStatus("error");
      toast.error("Verifikasi gagal. Coba lagi.", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
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
              Satu langkah lagi menuju akun terverifikasi
            </h2>
            <div className="h-1 w-10 rounded-full bg-secondary" />
            <p className="text-[15px] leading-6 text-[#5f6573]">
              Data KTP kamu hanya digunakan untuk verifikasi identitas
              keanggotaan.
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
                  Data sesuai KTP kamu
                </h2>

                <Input
                  inputId="ktp-full-name"
                  label="Nama Lengkap (sesuai KTP)"
                  placeholder="Nama lengkap sesuai KTP"
                  value={formData.ktpFullName}
                  onChange={(e) =>
                    updateFormData("ktpFullName", e.target.value)
                  }
                  required
                />
                <NumberInput
                  inputId="nik"
                  label="NIK"
                  placeholder="16 digit NIK"
                  mode="numeric"
                  characterLength={16}
                  value={formData.nik}
                  onValueChange={(value) => updateFormData("nik", value)}
                  required
                />
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <NumberInput
                    inputId="phone-number"
                    label="Nomor HP"
                    placeholder="081234567890"
                    mode="numeric"
                    value={formData.phoneNumber}
                    onValueChange={(value) =>
                      updateFormData("phoneNumber", value)
                    }
                    required
                  />
                  <Input
                    inputId="date-of-birth"
                    type="date"
                    label="Tanggal Lahir"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      updateFormData("dateOfBirth", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-0.5 pl-1 text-[15px] font-medium text-[#172033]">
                    Jenis Kelamin
                    <span className="text-destructive">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <RadioButton<GenderEnum>
                      radioName="gender"
                      label="Laki-laki"
                      value="male"
                      selectedValue={formData.gender}
                      onChange={(value) => updateFormData("gender", value)}
                    />
                    <RadioButton<GenderEnum>
                      radioName="gender"
                      label="Perempuan"
                      value="female"
                      selectedValue={formData.gender}
                      onChange={(value) => updateFormData("gender", value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-[#172033]">
                  Alamat sesuai KTP kamu
                </h2>

                <SearchableSelect
                  selectId="province"
                  label="Provinsi"
                  placeholder="Cari provinsi..."
                  value={formData.province}
                  onChange={handleProvinceChange}
                  loadOptions={loadProvinceOptions}
                  defaultOptions={provinceOptions}
                  debounceMs={400}
                  required
                />
                <SearchableSelect
                  key={`city-${formData.province?.value ?? "none"}`}
                  selectId="city"
                  label="Kota/Kabupaten"
                  placeholder="Cari kota/kabupaten..."
                  value={formData.city}
                  onChange={handleCityChange}
                  loadOptions={loadCityOptions}
                  debounceMs={400}
                  disabled={!formData.province}
                  required
                />
                <SearchableSelect
                  key={`district-${formData.city?.value ?? "none"}`}
                  selectId="district"
                  label="Kecamatan"
                  placeholder="Cari kecamatan..."
                  value={formData.district}
                  onChange={(option) => updateFormData("district", option)}
                  loadOptions={loadDistrictOptions}
                  debounceMs={400}
                  disabled={!formData.city}
                  required
                />
                <Input
                  inputId="address-street"
                  label="Alamat (Jalan)"
                  placeholder="Jl. Merdeka No. 10"
                  value={formData.addressStreet}
                  onChange={(e) =>
                    updateFormData("addressStreet", e.target.value)
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
                  {status === "submitting" ? "Mengirim..." : "Verifikasi Akun"}
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
