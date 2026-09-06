"use client";

import { Building, ShieldCheck, type LucideIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { AccessGrantEntry } from "@/apis/access-grants";
import type { OrganizationDetail } from "@/apis/organizations";
import { updateOrganization } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import EntityAccessTab from "../admin/EntityAccessTab";
import AdminPageTitle from "../common/AdminPageTitle";
import Input from "../fields/Input";
import OrganizationLogoField from "../forms/OrganizationLogoField";

export type OrganizationSettingsTab = "profile" | "access";

const TABS: { id: OrganizationSettingsTab; label: string; icon: LucideIcon }[] =
  [
    { id: "profile", label: "Profil", icon: Building },
    { id: "access", label: "Akses", icon: ShieldCheck },
  ];

interface OrganizationSettingsPageProps {
  organization: OrganizationDetail;
  grants: AccessGrantEntry[];
  canManageAccess: boolean;
  viewerId?: string;
  mainSiteHref: string;
}

export default function OrganizationSettingsPage({
  organization,
  grants,
  canManageAccess,
  viewerId,
  mainSiteHref,
}: OrganizationSettingsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab: OrganizationSettingsTab =
    searchParams.get("tab") === "access" ? "access" : "profile";
  const [activeTab, setActiveTab] =
    useState<OrganizationSettingsTab>(initialTab);

  function selectTab(tab: OrganizationSettingsTab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "profile") params.delete("tab");
    else params.set("tab", tab);
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageTitle
        description={`Kelola profil dan akses dashboard ${organization.name}.`}
      >
        Pengaturan
      </AdminPageTitle>

      <div className="mt-6 overflow-x-auto">
        <div
          role="tablist"
          aria-label="Pengaturan Organisasi"
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
          <ProfileTab organization={organization} />
        ) : (
          <EntityAccessTab
            entityType="organization"
            entityId={organization.id}
            grants={grants}
            canInvite={canManageAccess}
            canRevoke={canManageAccess}
            viewerId={viewerId}
            mainSiteHref={mainSiteHref}
          />
        )}
      </div>
    </div>
  );
}

function ProfileTab({ organization }: { organization: OrganizationDetail }) {
  const router = useRouter();
  const [name, setName] = useState(organization.name);
  const [slug, setSlug] = useState(organization.slug);
  const [logoUrl, setLogoUrl] = useState(organization.logo_url ?? "");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nama organisasi wajib diisi.");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug organisasi wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateOrganization({
        id: organization.id,
        name,
        slug,
        logo_url: logoUrl,
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan perubahan.");
        return;
      }

      toast.success("Profil organisasi berhasil diperbarui.");
      router.refresh();
    } catch (err) {
      console.error("[OrganizationSettingsPage] save profile threw:", err);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-[#e6e9ef] bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-56 lg:shrink-0">
          <OrganizationLogoField
            imageUrl={logoUrl}
            onChange={setLogoUrl}
            onUploadingChange={setIsUploadingLogo}
            disabled={isSaving}
            size={160}
            layout="column"
          />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <Input
            inputId="organization-settings-name"
            label="Nama Organisasi"
            placeholder="Contoh: Himpunan Mahasiswa Islam"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1">
            <Input
              inputId="organization-settings-slug"
              label="Slug"
              placeholder="Contoh: hmi"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
            <p className="pl-1 text-xs text-[#5f6573]">
              Pengenal unik organisasi. Ubah hanya jika benar-benar perlu.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t border-[#e6e9ef] pt-4">
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSaving || isUploadingLogo}
        >
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </section>
  );
}
