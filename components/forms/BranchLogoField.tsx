"use client";

import { Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { compressImage } from "@/lib/compress-image";
import { supabase } from "@/lib/supabase";
import Button from "../buttons/Button";

const LOGO_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const LOGO_ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];
const LOGO_MAX_RAW_BYTES = 20 * 1024 * 1024;
const LOGO_MAX_BYTES = 5 * 1024 * 1024;

async function uploadBranchLogo(file: File, fileExt: string) {
  const filePath = `branches/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("hmi-connect")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("hmi-connect").getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error("missing public url");

  return data.publicUrl;
}

// Same RLS-rejection signature CreateFeedForms/MessageComposer already detect for their own bucket folders.
function isStoragePolicyError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes("row-level security")
  );
}

interface BranchLogoFieldProps {
  imageUrl: string;
  onChange: (imageUrl: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
  size?: number;
  layout?: "row" | "column";
}

// Mirrors CoordinatingBodyLogoField — same square rounded-lg preview + upload/remove pair, sized/laid out per caller, just uploading into the branches/ storage folder.
export default function BranchLogoField({
  imageUrl,
  onChange,
  onUploadingChange,
  disabled,
  size = 80,
  layout = "row",
}: BranchLogoFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isBusy = isUploading || disabled;

  function setUploading(value: boolean) {
    setIsUploading(value);
    onUploadingChange?.(value);
  }

  function handlePickClick() {
    inputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!LOGO_ALLOWED_TYPES.includes(file.type)) {
      toast.error("Format hanya boleh JPG, PNG, WEBP, atau AVIF.");
      return;
    }
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !LOGO_ALLOWED_EXTENSIONS.includes(fileExt)) {
      toast.error("Ekstensi file tidak valid.");
      return;
    }
    if (file.size > LOGO_MAX_RAW_BYTES) {
      toast.error("Ukuran logo maksimal 20MB.");
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      if (compressed.size > LOGO_MAX_BYTES) {
        toast.error("Logo masih terlalu besar setelah dikompres.");
        return;
      }
      const compressedExt =
        compressed.name.split(".").pop()?.toLowerCase() ?? fileExt;
      const publicUrl = await uploadBranchLogo(compressed, compressedExt);
      onChange(publicUrl);
    } catch (error) {
      console.error("[BranchLogoField] logo upload threw:", error);
      if (isStoragePolicyError(error)) {
        toast.error(
          "Upload logo ditolak Supabase. Izinkan folder branches di bucket hmi-connect."
        );
      } else {
        toast.error("Gagal mengunggah logo. Coba lagi.");
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="pl-1 text-[15px] font-medium text-[#172033]">
        Logo Cabang
      </label>
      <div
        className={
          layout === "column"
            ? "flex flex-col items-start gap-3"
            : "flex items-center gap-4"
        }
      >
        <div
          className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e6e9ef] bg-[#f5f7fb]"
          style={{ width: size, height: size }}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Logo Cabang"
              width={size}
              height={size}
              className="size-full object-cover"
            />
          ) : (
            <ImageIcon
              className={size >= 120 ? "size-10 text-[#5f6573]" : "size-6 text-[#5f6573]"}
            />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.avif"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="light"
            size="sm"
            onClick={handlePickClick}
            disabled={isBusy}
            className="w-fit"
          >
            {isUploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            {isUploading ? "Mengunggah..." : "Unggah Logo"}
          </Button>
          {imageUrl && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onChange("")}
              disabled={isBusy}
              className="w-fit"
            >
              <Trash2 className="size-3.5" />
              Hapus Logo
            </Button>
          )}
          <p className="text-xs text-[#5f6573]">Rasio persegi, maksimal 5MB.</p>
        </div>
      </div>
    </div>
  );
}
