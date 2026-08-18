"use client";

import {
  Building2,
  Loader2,
  ShieldCheck,
  Trash2,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { CoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import type { UserListEntry } from "@/apis/users";
import {
  grantCoordinatingBodyAdmin,
  revokeCoordinatingBodyAdmin,
  updateCoordinatingBody,
} from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import AdminPageTitle from "../common/AdminPageTitle";
import Avatar from "../common/Avatar";
import Input from "../fields/Input";
import SearchableSelect, {
  type SearchableOption,
} from "../fields/SearchableSelect";
import TextArea from "../fields/TextArea";
import CoordinatingBodyLogoField from "../forms/CoordinatingBodyLogoField";
import AlertConfirmation from "../modals/AlertConfirmation";
import Modal from "../modals/Modal";
import EmptyState from "../states/EmptyState";

export type CoordinatingBodySettingsTab = "profile" | "access";

const TABS: { id: CoordinatingBodySettingsTab; label: string; icon: LucideIcon }[] = [
  { id: "profile", label: "Profil", icon: Building2 },
  { id: "access", label: "Akses", icon: ShieldCheck },
];

interface CoordinatingBodySettingsPageProps {
  coordinatingBody: CoordinatingBodyDetail;
  admins: UserListEntry[];
  isSuperAdmin: boolean;
}

export default function CoordinatingBodySettingsPage({
  coordinatingBody,
  admins,
  isSuperAdmin,
}: CoordinatingBodySettingsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab: CoordinatingBodySettingsTab =
    searchParams.get("tab") === "access" ? "access" : "profile";
  const [activeTab, setActiveTab] =
    useState<CoordinatingBodySettingsTab>(initialTab);

  function selectTab(tab: CoordinatingBodySettingsTab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "profile") params.delete("tab");
    else params.set("tab", tab);
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageTitle description="Kelola profil dan akses dashboard Badko ini.">
        Pengaturan
      </AdminPageTitle>

      <div className="mt-6 overflow-x-auto">
        <div
          role="tablist"
          aria-label="Pengaturan Badko"
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
          <ProfileTab coordinatingBody={coordinatingBody} />
        ) : (
          <AccessTab
            coordinatingBodyId={coordinatingBody.id}
            admins={admins}
            isSuperAdmin={isSuperAdmin}
          />
        )}
      </div>
    </div>
  );
}

function ProfileTab({
  coordinatingBody,
}: {
  coordinatingBody: CoordinatingBodyDetail;
}) {
  const router = useRouter();
  const [name, setName] = useState(coordinatingBody.name);
  const [description, setDescription] = useState(
    coordinatingBody.description ?? ""
  );
  const [imageUrl, setImageUrl] = useState(coordinatingBody.image_url ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nama Badko wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateCoordinatingBody({
        id: coordinatingBody.id,
        name,
        description,
        image_url: imageUrl,
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan perubahan.");
        return;
      }

      toast.success("Profil Badko berhasil diperbarui.");
      router.refresh();
    } catch (err) {
      console.error("[CoordinatingBodySettingsPage] save profile threw:", err);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-[#e6e9ef] bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-56 lg:shrink-0">
          <CoordinatingBodyLogoField
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
            inputId="coordinating-body-settings-name"
            label="Nama Badko"
            placeholder="Contoh: Sumatera Bagian Utara"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <TextArea
            textAreaId="coordinating-body-settings-description"
            label="Deskripsi"
            placeholder="Ceritakan sekilas tentang Badko ini"
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

function AccessTab({
  coordinatingBodyId,
  admins,
  isSuperAdmin,
}: {
  coordinatingBodyId: string;
  admins: UserListEntry[];
  isSuperAdmin: boolean;
}) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<UserListEntry | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  async function handleRevoke() {
    if (!revokeTarget) return;
    setIsRevoking(true);
    try {
      const result = await revokeCoordinatingBodyAdmin(revokeTarget.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal mencabut akses.");
        return;
      }
      toast.success(`Akses ${revokeTarget.full_name} berhasil dicabut.`);
      setRevokeTarget(null);
      router.refresh();
    } catch (err) {
      console.error("[CoordinatingBodySettingsPage] revoke access threw:", err);
      toast.error("Gagal mencabut akses.");
    } finally {
      setIsRevoking(false);
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#172033]">
            Admin Badko
          </h2>
          <p className="mt-1 text-sm text-[#5f6573]">
            Pengguna yang memiliki akses untuk mengelola dashboard Badko ini.
          </p>
        </div>
        {isSuperAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="w-fit"
          >
            <UserPlus className="size-4" />
            Tambah Akses
          </Button>
        )}
      </div>

      {!isSuperAdmin && (
        <p className="mt-3 text-xs text-[#5f6573]">
          Hanya Super Admin yang dapat menambah atau mencabut akses.
        </p>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
        {admins.length === 0 ? (
          <EmptyState
            title="Belum ada admin"
            description="Admin yang diberi akses untuk Badko ini akan ditampilkan di sini."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase tracking-wide text-[#5f6573]">
                <tr>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e9ef] text-[13px]">
                {admins.map((admin) => (
                  <tr key={admin.id} className="align-middle">
                    <td className="px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar
                          src={admin.avatar}
                          name={admin.full_name}
                          size={36}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#172033]">
                            {admin.full_name}
                          </p>
                          <p className="truncate text-[13px] text-[#5f6573]">
                            @{admin.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {isSuperAdmin ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setRevokeTarget(admin)}
                            aria-label={`Cabut akses ${admin.full_name}`}
                            className="text-destructive hover:bg-destructive-soft"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : (
                          <span className="text-[#5f6573]">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isSuperAdmin && (
        <AddAccessModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          coordinatingBodyId={coordinatingBodyId}
          onGranted={() => {
            setShowAddModal(false);
            router.refresh();
          }}
        />
      )}

      <AlertConfirmation
        open={revokeTarget !== null}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title="Cabut akses admin ini?"
        message={`${revokeTarget?.full_name} tidak akan bisa lagi mengelola dashboard Badko ini.`}
        confirmLabel="Cabut Akses"
        loading={isRevoking}
      />
    </section>
  );
}

function AddAccessModal({
  open,
  onClose,
  coordinatingBodyId,
  onGranted,
}: {
  open: boolean;
  onClose: () => void;
  coordinatingBodyId: string;
  onGranted: () => void;
}) {
  const [selected, setSelected] = useState<SearchableOption | null>(null);
  const [isGranting, setIsGranting] = useState(false);

  async function loadOptions(inputValue: string, page: number) {
    const params = new URLSearchParams({
      q: inputValue,
      page: String(page),
      coordinating_body_id: coordinatingBodyId,
    });
    const response = await fetch(`/api/users/search?${params}`);
    const json = await response.json();
    const results: { id: string; full_name: string; avatar?: string }[] =
      json.data ?? [];
    return {
      options: results.map((item) => ({
        label: item.full_name,
        value: item.id,
        image: item.avatar,
      })),
      hasMore: Boolean(json.hasMore),
    };
  }

  async function handleGrant() {
    if (!selected) {
      toast.error("Pilih pengguna terlebih dahulu.");
      return;
    }

    setIsGranting(true);
    try {
      const result = await grantCoordinatingBodyAdmin(String(selected.value));
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menambahkan akses.");
        return;
      }
      toast.success(`Akses berhasil diberikan ke ${selected.label}.`);
      setSelected(null);
      onGranted();
    } catch (err) {
      console.error("[CoordinatingBodySettingsPage] grant access threw:", err);
      toast.error("Gagal menambahkan akses.");
    } finally {
      setIsGranting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Tambah Akses">
      <div className="flex flex-col gap-4">
        <SearchableSelect
          selectId="coordinating-body-add-access"
          label="Cari Kader"
          placeholder="Cari nama kader..."
          value={selected}
          onChange={setSelected}
          loadOptions={loadOptions}
          showOptionAvatar
        />
        <p className="text-xs text-[#5f6573]">
          Pengguna yang dipilih harus sudah berperan sebagai Administrator.
          Promosikan role-nya lewat User Management jika belum.
        </p>

        <div className="mt-2 flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
          <Button variant="outline" onClick={onClose} disabled={isGranting}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleGrant} disabled={isGranting}>
            {isGranting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <UserPlus className="size-3.5" />
            )}
            {isGranting ? "Menambahkan..." : "Tambah"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
