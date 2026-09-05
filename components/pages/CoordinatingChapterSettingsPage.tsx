"use client";

import {
  ShieldCheck,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { AccessGrantEntry } from "@/apis/access-grants";
import type { CoordinatingChapterDetail } from "@/apis/coordinating-chapters";
import {
  updateCoordinatingChapter,
} from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import EntityAccessTab from "../admin/EntityAccessTab";
import AdminPageTitle from "../common/AdminPageTitle";
import Input from "../fields/Input";
import TextArea from "../fields/TextArea";
import CoordinatingChapterLogoField from "../forms/CoordinatingChapterLogoField";

export type CoordinatingChapterSettingsTab = "profile" | "access";

const TABS: {
  id: CoordinatingChapterSettingsTab;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "profile", label: "Profil", icon: Waypoints },
  { id: "access", label: "Akses", icon: ShieldCheck },
];

interface CoordinatingChapterSettingsPageProps {
  coordinatingChapter: CoordinatingChapterDetail;
  grants: AccessGrantEntry[];
  canManageAccess: boolean;
}

export default function CoordinatingChapterSettingsPage({
  coordinatingChapter,
  grants,
  canManageAccess,
}: CoordinatingChapterSettingsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab: CoordinatingChapterSettingsTab =
    searchParams.get("tab") === "access" ? "access" : "profile";
  const [activeTab, setActiveTab] =
    useState<CoordinatingChapterSettingsTab>(initialTab);

  function selectTab(tab: CoordinatingChapterSettingsTab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "profile") params.delete("tab");
    else params.set("tab", tab);
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageTitle description="Kelola profil dan akses dashboard Korkom ini.">
        Pengaturan
      </AdminPageTitle>

      <div className="mt-6 overflow-x-auto">
        <div
          role="tablist"
          aria-label="Pengaturan Korkom"
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
          <ProfileTab coordinatingChapter={coordinatingChapter} />
        ) : (
          <EntityAccessTab
            entityType="coordinating_chapter"
            entityId={coordinatingChapter.id}
            grants={grants}
            canManageAccess={canManageAccess}
          />
        )}
      </div>
    </div>
  );
}

function ProfileTab({
  coordinatingChapter,
}: {
  coordinatingChapter: CoordinatingChapterDetail;
}) {
  const router = useRouter();
  const [name, setName] = useState(coordinatingChapter.name);
  const [description, setDescription] = useState(
    coordinatingChapter.description ?? ""
  );
  const [imageUrl, setImageUrl] = useState(coordinatingChapter.image_url ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nama Korkom wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateCoordinatingChapter({
        id: coordinatingChapter.id,
        name,
        description,
        image_url: imageUrl,
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan perubahan.");
        return;
      }

      toast.success("Profil Korkom berhasil diperbarui.");
      router.refresh();
    } catch (err) {
      console.error("[CoordinatingChapterSettingsPage] save profile threw:", err);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-[#e6e9ef] bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-56 lg:shrink-0">
          <CoordinatingChapterLogoField
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
            inputId="coordinating-chapter-settings-name"
            label="Nama Korkom"
            placeholder="Contoh: Korkom Wilayah Timur"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <TextArea
            textAreaId="coordinating-chapter-settings-description"
            label="Deskripsi"
            placeholder="Ceritakan sekilas tentang Korkom ini"
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
