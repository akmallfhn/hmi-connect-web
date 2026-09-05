"use client";

import {
  School,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { AccessGrantEntry } from "@/apis/access-grants";
import type { ChapterDetail } from "@/apis/chapters";
import { updateChapter } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import EntityAccessTab from "../admin/EntityAccessTab";
import AdminPageTitle from "../common/AdminPageTitle";
import Input from "../fields/Input";
import TextArea from "../fields/TextArea";
import ChapterLogoField from "../forms/ChapterLogoField";

export type ChapterSettingsTab = "profile" | "access";

const TABS: { id: ChapterSettingsTab; label: string; icon: LucideIcon }[] = [
  { id: "profile", label: "Profil", icon: School },
  { id: "access", label: "Akses", icon: ShieldCheck },
];

interface ChapterSettingsPageProps {
  chapter: ChapterDetail;
  grants: AccessGrantEntry[];
  canManageAccess: boolean;
}

export default function ChapterSettingsPage({
  chapter,
  grants,
  canManageAccess,
}: ChapterSettingsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab: ChapterSettingsTab =
    searchParams.get("tab") === "access" ? "access" : "profile";
  const [activeTab, setActiveTab] = useState<ChapterSettingsTab>(initialTab);

  function selectTab(tab: ChapterSettingsTab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "profile") params.delete("tab");
    else params.set("tab", tab);
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageTitle description="Kelola profil dan akses dashboard Komisariat ini.">
        Pengaturan
      </AdminPageTitle>

      <div className="mt-6 overflow-x-auto">
        <div
          role="tablist"
          aria-label="Pengaturan Komisariat"
          className="inline-flex min-w-max rounded-full border border-[#e6e9ef] bg-white p-1"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`settings-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`settings-panel-${tab.id}`}
                onClick={() => selectTab(tab.id)}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  isActive
                    ? "bg-secondary text-white shadow-sm"
                    : "text-[#5f6573] hover:bg-secondary-soft hover:text-secondary"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`settings-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`settings-tab-${activeTab}`}
        className="mt-6"
      >
        {activeTab === "profile" ? (
          <ProfileTab chapter={chapter} />
        ) : (
          <EntityAccessTab
            entityType="chapter"
            entityId={chapter.id}
            grants={grants}
            canManageAccess={canManageAccess}
          />
        )}
      </div>
    </div>
  );
}

function ProfileTab({ chapter }: { chapter: ChapterDetail }) {
  const router = useRouter();
  const [name, setName] = useState(chapter.name);
  const [description, setDescription] = useState(chapter.description ?? "");
  const [imageUrl, setImageUrl] = useState(chapter.image_url ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nama Komisariat wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateChapter({
        id: chapter.id,
        name,
        description,
        image_url: imageUrl,
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan perubahan.");
        return;
      }

      toast.success("Profil Komisariat berhasil diperbarui.");
      router.refresh();
    } catch (err) {
      console.error("[ChapterSettingsPage] save profile threw:", err);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-[#e6e9ef] bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-56 lg:shrink-0">
          <ChapterLogoField
            imageUrl={imageUrl}
            onChange={setImageUrl}
            onUploadingChange={setIsUploadingImage}
            disabled={isSaving}
            size={160}
            layout="column"
          />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <Input
            inputId="chapter-settings-name"
            label="Nama Komisariat"
            placeholder="Contoh: HMI Komisariat Fakultas Teknik USK"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <TextArea
            textAreaId="chapter-settings-description"
            label="Deskripsi"
            placeholder="Ceritakan sekilas tentang Komisariat ini"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={10}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t border-[#e6e9ef] pt-4">
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSaving || isUploadingImage}
        >
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </section>
  );
}
