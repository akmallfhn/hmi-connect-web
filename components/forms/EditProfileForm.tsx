"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SocialMediaPlatform } from "@/apis/social-media-platforms";
import type { SocialMediaAccountEntry } from "@/apis/users";
import {
  createSocialMediaAccount,
  deleteSocialMediaAccount,
  updateSocialMediaAccount,
  updateUser,
} from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import Select, { type SelectOption } from "../fields/Select";
import TextArea from "../fields/TextArea";
import Modal from "../modals/Modal";

type SocialMediaDraft = {
  id: string;
  platformId: number | null;
  platformName: string;
  logoUrl?: string | null;
  url: string;
  isNew: boolean;
  removed: boolean;
};

function normalizeSocialUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function toSocialDrafts(entries: SocialMediaAccountEntry[]): SocialMediaDraft[] {
  return entries.map((entry) => ({
    id: entry.id,
    platformId: entry.platform_id,
    platformName: entry.platform_name,
    logoUrl: entry.logo_url,
    url: entry.url,
    isNew: false,
    removed: false,
  }));
}

function emptySocialDraft(): SocialMediaDraft {
  return {
    id: `new-${crypto.randomUUID()}`,
    platformId: null,
    platformName: "",
    logoUrl: null,
    url: "",
    isNew: true,
    removed: false,
  };
}

interface EditProfileFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  fullName?: string;
  headline?: string;
  bio?: string;
  socialMediaAccounts: SocialMediaAccountEntry[];
  socialMediaPlatforms: SocialMediaPlatform[];
}

export default function EditProfileForm({
  open,
  onClose,
  onSaved,
  userId,
  fullName,
  headline,
  bio,
  socialMediaAccounts,
  socialMediaPlatforms,
}: EditProfileFormProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Profil"
      panelClassName="max-w-2xl"
    >
      {open && (
        <ProfileFields
          onClose={onClose}
          onSaved={onSaved}
          userId={userId}
          fullName={fullName}
          headline={headline}
          bio={bio}
          socialMediaAccounts={socialMediaAccounts}
          socialMediaPlatforms={socialMediaPlatforms}
        />
      )}
    </Modal>
  );
}

interface ProfileFieldsProps {
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  fullName?: string;
  headline?: string;
  bio?: string;
  socialMediaAccounts: SocialMediaAccountEntry[];
  socialMediaPlatforms: SocialMediaPlatform[];
}

// Mounted only while open, so state always seeds fresh from props — no reset effect needed.
function ProfileFields({
  onClose,
  onSaved,
  userId,
  fullName,
  headline,
  bio,
  socialMediaAccounts,
  socialMediaPlatforms,
}: ProfileFieldsProps) {
  const [form, setForm] = useState({
    fullName: fullName ?? "",
    headline: headline ?? "",
    bio: bio ?? "",
  });
  const [socialDrafts, setSocialDrafts] = useState<SocialMediaDraft[]>(() =>
    toSocialDrafts(socialMediaAccounts)
  );
  const [isSaving, setIsSaving] = useState(false);

  const platformOptions: SelectOption[] = socialMediaPlatforms.map((platform) => ({
    label: platform.name,
    value: platform.id,
    image: platform.logo_url ?? undefined,
  }));

  for (const account of socialMediaAccounts) {
    const exists = platformOptions.some((option) => option.value === account.platform_id);
    if (!exists) {
      platformOptions.push({
        label: account.platform_name,
        value: account.platform_id,
        image: account.logo_url,
      });
    }
  }

  function updateSocialDraft<K extends keyof SocialMediaDraft>(
    id: string,
    key: K,
    value: SocialMediaDraft[K]
  ) {
    setSocialDrafts((prev) =>
      prev.map((draft) => (draft.id === id ? { ...draft, [key]: value } : draft))
    );
  }

  function addSocialDraft() {
    setSocialDrafts((prev) => [...prev, emptySocialDraft()]);
  }

  function toggleSocialRemoved(id: string) {
    setSocialDrafts((prev) =>
      prev.map((draft) =>
        draft.id === id ? { ...draft, removed: !draft.removed } : draft
      )
    );
  }

  async function handleSubmit() {
    if (!userId) {
      toast.error("ID pengguna tidak ditemukan.");
      return;
    }

    const activeSocialDrafts = socialDrafts.filter((draft) => !draft.removed);
    const incompleteSocial = activeSocialDrafts.find(
      (draft) => !draft.platformId || !draft.url.trim()
    );
    if (incompleteSocial) {
      toast.error("Lengkapi platform dan URL untuk setiap sosial media.");
      return;
    }

    const platformIds = activeSocialDrafts.map((draft) => draft.platformId);
    const hasDuplicatePlatform = new Set(platformIds).size !== platformIds.length;
    if (hasDuplicatePlatform) {
      toast.error("Satu platform hanya boleh ditautkan satu kali.");
      return;
    }

    setIsSaving(true);
    try {
      const profileResult = await updateUser({
        id: userId,
        full_name: form.fullName,
        headline: form.headline,
        bio: form.bio,
      });

      if (!isSuccessStatus(profileResult.status)) {
        toast.error(profileResult.message ?? "Gagal menyimpan perubahan.");
        return;
      }

      const socialResults = await Promise.all(
        socialDrafts.map((draft) => {
          if (draft.isNew) {
            if (draft.removed) return null;
            return createSocialMediaAccount({
              platform_id: Number(draft.platformId),
              url: normalizeSocialUrl(draft.url),
            });
          }
          if (draft.removed) {
            return deleteSocialMediaAccount(draft.id);
          }
          return updateSocialMediaAccount({
            id: draft.id,
            platform_id: Number(draft.platformId),
            url: normalizeSocialUrl(draft.url),
          });
        })
      );

      const attemptedSocialResults = socialResults.filter(Boolean);
      const failedSocialResults = attemptedSocialResults.filter(
        (result) => !isSuccessStatus(result!.status)
      );

      if (failedSocialResults.length > 0) {
        toast.error(
          failedSocialResults[0]?.message ??
            `${failedSocialResults.length} dari ${attemptedSocialResults.length} sosial media gagal disimpan.`
        );
        return;
      }

      toast.success("Profil berhasil diperbarui.");
      onSaved();
    } catch (err) {
      console.error("[EditProfileForm] update profile threw:", err);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <Input
          inputId="edit-full-name"
          label="Nama Lengkap"
          placeholder="Nama lengkap kamu"
          value={form.fullName}
          onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
        />
        <Input
          inputId="edit-headline"
          label="Headline"
          placeholder="Contoh: Ketua Bidang"
          value={form.headline}
          onChange={(e) => setForm((prev) => ({ ...prev, headline: e.target.value }))}
        />
        <TextArea
          textAreaId="edit-bio"
          label="Bio"
          placeholder="Ceritakan sedikit tentang dirimu"
          value={form.bio}
          onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
          rows={4}
          characterLength={280}
        />
      </section>

      <section className="border-t border-[#e6e9ef] pt-5">
        <div>
          <h3 className="text-sm font-semibold text-[#172033]">Sosial Media</h3>
          <p className="mt-1 text-xs text-[#5f6573]">
            Tambahkan link akun yang ingin ditampilkan di profil.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {socialDrafts.length === 0 && (
            <p className="rounded-xl border border-dashed border-[#dbe3ef] px-4 py-5 text-center text-sm text-[#5f6573]">
              Belum ada sosial media yang ditambahkan.
            </p>
          )}

          {socialDrafts.map((draft, index) => (
            <div
              key={draft.id}
              className={[
                "flex flex-col gap-4 rounded-xl border p-4",
                draft.removed
                  ? "border-destructive/30 bg-destructive-soft/30"
                  : "border-[#e6e9ef]",
              ].join(" ")}
            >
              {(draft.isNew || draft.removed) && (
                <div className="flex flex-wrap gap-2">
                  {draft.isNew && (
                    <span className="inline-flex w-fit items-center rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                      Baru
                    </span>
                  )}
                  {draft.removed && (
                    <span className="inline-flex w-fit items-center rounded-full bg-destructive-soft px-2 py-0.5 text-xs font-semibold text-destructive">
                      Akan dihapus
                    </span>
                  )}
                </div>
              )}

              <Select
                selectId={`social-platform-${index}`}
                label="Platform"
                placeholder="Pilih platform"
                value={draft.platformId}
                disabled={draft.removed}
                onChange={(value) =>
                  updateSocialDraft(draft.id, "platformId", Number(value))
                }
                options={platformOptions}
                required
              />
              <Input
                inputId={`social-url-${index}`}
                label="URL"
                placeholder="https://instagram.com/username"
                value={draft.url}
                disabled={draft.removed}
                onChange={(e) => updateSocialDraft(draft.id, "url", e.target.value)}
                required
              />

              <div className="flex justify-end border-t border-[#e6e9ef] pt-4">
                <Button
                  variant={draft.removed ? "outline" : "destructive"}
                  size="sm"
                  onClick={() => toggleSocialRemoved(draft.id)}
                >
                  {draft.removed ? (
                    <>
                      <RotateCcw className="size-3.5" />
                      Batalkan
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-3.5" />
                      Hapus
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          onClick={addSocialDraft}
          disabled={isSaving}
          className="mt-4 w-full gap-1.5 rounded-lg border border-dashed border-[#dbe3ef] py-2.5 text-primary hover:bg-primary-soft"
        >
          <Plus className="size-4" />
          Tambah Sosial Media
        </Button>
      </section>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
