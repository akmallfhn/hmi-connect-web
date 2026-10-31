"use client";

import { IconBuildingBank } from "@tabler/icons-react";
import { Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { optimizeImage } from "@/lib/optimize-image";
import { uploadPublicMediaFile } from "@/lib/media-upload";
import Button from "../buttons/Button";

const LOGO_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const LOGO_ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const LOGO_MAX_RAW_BYTES = 20 * 1024 * 1024;

export type InstitutionLogoValue = {
  mediaId: string;
  imageUrl: string;
};

interface InstitutionLogoFieldProps {
  imageUrl: string;
  onChange: (value: InstitutionLogoValue) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
}

export default function InstitutionLogoField({
  imageUrl,
  onChange,
  onUploadingChange,
  disabled,
}: InstitutionLogoFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isBusy = isUploading || disabled;

  function setUploading(value: boolean) {
    setIsUploading(value);
    onUploadingChange?.(value);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!LOGO_ALLOWED_TYPES.includes(file.type)) {
      toast.error("Format hanya boleh JPG, PNG, atau WEBP.");
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
      const optimized = await optimizeImage(file, "institution_image");
      const { assetId, publicUrl } = await uploadPublicMediaFile(
        optimized,
        "institution_image",
      );
      onChange({ mediaId: assetId, imageUrl: publicUrl });
    } catch (error) {
      console.error("[InstitutionLogoField] logo upload threw:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal mengunggah logo. Coba lagi.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="pl-1 text-[15px] font-medium text-heading">
        Logo Institusi
      </label>
      <div className="flex items-center gap-4">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Logo Institusi"
              width={80}
              height={80}
              className="size-full object-cover"
            />
          ) : (
            <IconBuildingBank className="size-7 text-muted-foreground" stroke={1.8} />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="light"
            size="sm"
            onClick={() => inputRef.current?.click()}
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
              onClick={() => onChange({ mediaId: "", imageUrl: "" })}
              disabled={isBusy}
              className="w-fit"
            >
              <Trash2 className="size-3.5" />
              Hapus Logo
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            Rasio persegi, JPG/PNG/WEBP, maksimal 2MB.
          </p>
        </div>
      </div>
    </div>
  );
}
