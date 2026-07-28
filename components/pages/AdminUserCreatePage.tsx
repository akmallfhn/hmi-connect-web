"use client";

import { ArrowLeft, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { createUser } from "@/lib/actions";
import { USER_ROLE_OPTIONS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { isSuccessStatus, type GenderEnum, type UserStatusEnum } from "@/lib/types";
import {
  isUsernameFormatValid,
  USERNAME_ERROR,
  USERNAME_PATTERN,
} from "@/lib/username";
import Button from "../buttons/Button";
import Switch from "../buttons/Switch";
import { getInitials } from "../common/Avatar";
import Input from "../fields/Input";
import RadioButton from "../fields/RadioButton";
import SearchableSelect, { type SearchableOption } from "../fields/SearchableSelect";
import Select from "../fields/Select";
import TextArea from "../fields/TextArea";

const STATUS_OPTIONS: { label: string; value: UserStatusEnum }[] = [
  { label: "Pending", value: "pending" },
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

const AVATAR_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const AVATAR_ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e6e9ef] bg-white p-5">
      <h2 className="text-sm font-semibold text-[#172033]">{title}</h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

export default function AdminUserCreatePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [roleId, setRoleId] = useState<number>(2);
  const [status, setStatus] = useState<UserStatusEnum>("pending");
  const [isVerified, setIsVerified] = useState(false);

  const [ktpFullName, setKtpFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<GenderEnum | null>(null);
  const [addressStreet, setAddressStreet] = useState("");
  const [province, setProvince] = useState<SearchableOption | null>(null);
  const [city, setCity] = useState<SearchableOption | null>(null);
  const [district, setDistrict] = useState<SearchableOption | null>(null);

  const [branch, setBranch] = useState<SearchableOption | null>(null);
  const [chapter, setChapter] = useState<SearchableOption | null>(null);

  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  function handleAvatarPickClick() {
    avatarInputRef.current?.click();
  }

  async function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > AVATAR_MAX_BYTES) {
      toast.error("Ukuran foto maksimal 2MB.");
      return;
    }
    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
      toast.error("Format hanya boleh JPG, PNG, WEBP, atau AVIF.");
      return;
    }
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !AVATAR_ALLOWED_EXTENSIONS.includes(fileExt)) {
      toast.error("Ekstensi file tidak valid.");
      return;
    }

    const filePath = `avatars/admin-create-${Date.now()}.${fileExt}`;

    setIsUploadingAvatar(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from("hmi-connect")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("[AdminUserCreatePage] avatar upload error:", uploadError.message);
        toast.error("Gagal mengunggah foto. Coba lagi.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("hmi-connect")
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        toast.error("Gagal mendapatkan URL foto.");
        return;
      }

      setAvatar(publicUrlData.publicUrl);
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function loadBranchOptions(inputValue: string, page: number) {
    const params = new URLSearchParams({ page: String(page) });
    if (inputValue) params.set("q", inputValue);
    const response = await fetch(`/api/branches/search?${params}`);
    const json = await response.json();
    const results: { id: string; name: string }[] = json.data ?? [];
    return {
      options: results.map((item) => ({ label: item.name, value: item.id })),
      hasMore: Boolean(json.hasMore),
    };
  }

  async function loadChapterOptions(inputValue: string, page: number) {
    if (!branch) return { options: [], hasMore: false };
    const params = new URLSearchParams({
      page: String(page),
      branch_id: String(branch.value),
    });
    if (inputValue) params.set("q", inputValue);
    const response = await fetch(`/api/chapters/search?${params}`);
    const json = await response.json();
    const results: { id: string; name: string }[] = json.data ?? [];
    return {
      options: results.map((item) => ({ label: item.name, value: item.id })),
      hasMore: Boolean(json.hasMore),
    };
  }

  async function loadProvinceOptions(inputValue: string, page: number) {
    const params = new URLSearchParams({ page: String(page) });
    if (inputValue) params.set("q", inputValue);
    const response = await fetch(`/api/provinces/search?${params}`);
    const json = await response.json();
    const results: { id: number; name: string }[] = json.data ?? [];
    return {
      options: results.map((item) => ({ label: item.name, value: item.id })),
      hasMore: Boolean(json.hasMore),
    };
  }

  async function loadCityOptions(inputValue: string, page: number) {
    if (!province) return { options: [], hasMore: false };
    const params = new URLSearchParams({
      page: String(page),
      province_id: String(province.value),
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
    if (!city) return { options: [], hasMore: false };
    const params = new URLSearchParams({
      page: String(page),
      city_id: String(city.value),
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

  async function handleSubmit() {
    const trimmedUsername = username.trim();

    if (!fullName.trim() || !email.trim()) {
      toast.error("Nama lengkap dan email wajib diisi.");
      return;
    }
    if (trimmedUsername && !isUsernameFormatValid(trimmedUsername)) {
      toast.error("Username tidak valid.");
      return;
    }

    setUsernameError("");
    setIsSaving(true);
    try {
      const result = await createUser({
        full_name: fullName,
        email,
        ...(trimmedUsername ? { username: trimmedUsername } : {}),
        ...(avatar ? { avatar } : {}),
        role_id: roleId,
        status,
        is_verified: isVerified,
        ...(ktpFullName ? { ktp_full_name: ktpFullName } : {}),
        ...(phoneNumber ? { phone_number: phoneNumber } : {}),
        ...(dateOfBirth ? { date_of_birth: dateOfBirth } : {}),
        ...(gender ? { gender } : {}),
        ...(addressStreet ? { address_street: addressStreet } : {}),
        ...(district ? { district_id: Number(district.value) } : {}),
        ...(chapter ? { chapter_id: String(chapter.value) } : {}),
        ...(headline ? { headline } : {}),
        ...(bio ? { bio } : {}),
      });

      if (!isSuccessStatus(result.status)) {
        if (result.status === "CONFLICT") {
          const message =
            "Email, username, atau nomor kartu ini sudah digunakan akun lain.";
          setUsernameError(message);
          toast.error(message);
          return;
        }
        toast.error(result.message ?? "Gagal membuat user.");
        return;
      }

      toast.success("User berhasil dibuat.");
      const createdUsername = result.data?.username;
      window.location.href = createdUsername
        ? `/master/users/${encodeURIComponent(createdUsername)}`
        : "/master/users";
    } catch (err) {
      console.error("[AdminUserCreatePage] createUser threw:", err);
      toast.error("Gagal membuat user.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href="/master/users" className="inline-block w-fit">
        <Button variant="ghost">
          <ArrowLeft className="size-4" />
          Kembali ke daftar user
        </Button>
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">
            Tambah User
          </h1>
          <p className="mt-1.5 text-sm text-[#5f6573]">
            Buat akun user baru secara langsung dari panel admin.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-fit"
        >
          {isSaving ? "Menyimpan..." : "Simpan User"}
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard title="Akun & Peran">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-[#e6e9ef]">
              {avatar ? (
                <Image
                  src={avatar}
                  alt="Foto profil"
                  width={64}
                  height={64}
                  className="size-full object-cover"
                />
              ) : (
                <div
                  style={{ fontSize: 64 * 0.4 }}
                  className="flex size-full items-center justify-center bg-primary-soft font-semibold text-primary"
                >
                  {getInitials(fullName || "?")}
                </div>
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.avif"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="light"
                size="sm"
                onClick={handleAvatarPickClick}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Upload className="size-3.5" />
                )}
                {isUploadingAvatar ? "Mengunggah..." : "Unggah Foto"}
              </Button>
              {avatar && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setAvatar("")}
                  disabled={isUploadingAvatar}
                >
                  <Trash2 className="size-3.5" />
                  Hapus
                </Button>
              )}
            </div>
          </div>

          <Input
            inputId="create-full-name"
            label="Nama Lengkap"
            placeholder="Contoh: Akmal Luthfiansyah"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            inputId="create-email"
            label="Email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            inputId="create-username"
            label="Username"
            placeholder="Opsional — bisa diisi belakangan"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            pattern={USERNAME_PATTERN}
            patternErrorMessage={USERNAME_ERROR}
            errorMessage={usernameError}
            autoCapitalize="none"
            spellCheck={false}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              selectId="create-role"
              label="Role"
              placeholder="Pilih role"
              value={roleId}
              onChange={(value) => setRoleId(Number(value))}
              options={USER_ROLE_OPTIONS}
              required
            />
            <Select
              selectId="create-status"
              label="Status"
              placeholder="Pilih status"
              value={status}
              onChange={(value) => setStatus(value as UserStatusEnum)}
              options={STATUS_OPTIONS}
              required
            />
          </div>
          <Switch
            switchId="create-is-verified"
            label="Terverifikasi"
            checked={isVerified}
            onChange={setIsVerified}
          />
        </SectionCard>

        <SectionCard title="Data KTP & Kontak">
          <Input
            inputId="create-ktp-name"
            label="Nama Lengkap (sesuai KTP)"
            placeholder="Sesuai KTP"
            value={ktpFullName}
            onChange={(e) => setKtpFullName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              inputId="create-phone"
              label="Nomor HP"
              placeholder="081234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <Input
              inputId="create-dob"
              type="date"
              label="Tanggal Lahir"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="pl-1 text-[15px] font-medium text-[#172033]">
              Jenis Kelamin
            </label>
            <div className="grid grid-cols-2 gap-3">
              <RadioButton<GenderEnum>
                radioName="create-gender"
                label="Laki-laki"
                value="male"
                selectedValue={gender}
                onChange={setGender}
              />
              <RadioButton<GenderEnum>
                radioName="create-gender"
                label="Perempuan"
                value="female"
                selectedValue={gender}
                onChange={setGender}
              />
            </div>
          </div>
          <Input
            inputId="create-address"
            label="Alamat (Jalan)"
            placeholder="Jl. Merdeka No. 10"
            value={addressStreet}
            onChange={(e) => setAddressStreet(e.target.value)}
          />
          <SearchableSelect
            selectId="create-province"
            label="Provinsi"
            placeholder="Cari provinsi..."
            value={province}
            onChange={(option) => {
              setProvince(option);
              setCity(null);
              setDistrict(null);
            }}
            loadOptions={loadProvinceOptions}
          />
          <SearchableSelect
            key={`create-city-${province?.value ?? "none"}`}
            selectId="create-city"
            label="Kota/Kabupaten"
            placeholder="Cari kota/kabupaten..."
            value={city}
            onChange={(option) => {
              setCity(option);
              setDistrict(null);
            }}
            loadOptions={loadCityOptions}
            disabled={!province}
          />
          <SearchableSelect
            key={`create-district-${city?.value ?? "none"}`}
            selectId="create-district"
            label="Kecamatan"
            placeholder="Cari kecamatan..."
            value={district}
            onChange={setDistrict}
            loadOptions={loadDistrictOptions}
            disabled={!city}
          />
        </SectionCard>

        <SectionCard title="Organisasi">
          <SearchableSelect
            selectId="create-branch"
            label="Cabang"
            placeholder="Cari cabang..."
            value={branch}
            onChange={(option) => {
              setBranch(option);
              setChapter(null);
            }}
            loadOptions={loadBranchOptions}
          />
          <SearchableSelect
            key={`create-chapter-${branch?.value ?? "none"}`}
            selectId="create-chapter"
            label="Komisariat"
            placeholder="Cari komisariat..."
            value={chapter}
            onChange={setChapter}
            loadOptions={loadChapterOptions}
            disabled={!branch}
          />
        </SectionCard>

        <SectionCard title="Informasi Lainnya">
          <Input
            inputId="create-headline"
            label="Headline"
            placeholder="Contoh: Ketua Bidang"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
          <TextArea
            textAreaId="create-bio"
            label="Bio"
            placeholder="Ceritakan sedikit tentang user ini"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            characterLength={280}
          />
        </SectionCard>
      </div>
    </div>
  );
}
