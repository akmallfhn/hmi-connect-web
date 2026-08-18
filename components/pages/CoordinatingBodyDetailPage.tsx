"use client";

import {
  ArrowLeft,
  Ban,
  Building2,
  CalendarDays,
  GitBranch,
  GraduationCap,
  MapPin,
  Pencil,
  Power,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { BranchListEntry } from "@/apis/branches";
import type { CoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import type { TrainingListEntry } from "@/apis/trainings";
import { updateCoordinatingBody } from "@/lib/actions";
import { formatDateRange } from "@/lib/time-manipulation";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import AdminPageTitle from "../common/AdminPageTitle";
import Label from "../common/Label";
import EditCoordinatingBodyFormSheet from "../forms/EditCoordinatingBodyFormSheet";
import AlertConfirmation from "../modals/AlertConfirmation";
import EmptyState from "../states/EmptyState";
import {
  TrainingLevelLabel,
  TrainingRegistrationLabel,
  TrainingStatusLabel,
} from "../trainings/TrainingLabels";

export type CoordinatingBodyDetailTab =
  "profile" | "management" | "branches" | "trainings";

interface CoordinatingBodyDetailPageProps {
  coordinatingBody: CoordinatingBodyDetail;
  branches: BranchListEntry[];
  trainings: TrainingListEntry[];
  initialTab: CoordinatingBodyDetailTab;
  backHref: string;
  // Master manages Badko directly; Organization's view of a Badko is read-only (mirrors allowDelete on the list page).
  allowEdit?: boolean;
}

const TABS: {
  id: CoordinatingBodyDetailTab;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "profile", label: "Profil", icon: Building2 },
  { id: "management", label: "Kepengurusan", icon: Users },
  { id: "branches", label: "Daftar Cabang", icon: GitBranch },
  { id: "trainings", label: "Latihan Kader", icon: GraduationCap },
];

function formatCoordinatingBodyName(name: string) {
  const normalizedName = name.replace(/^(?:hmi\s+)?badko\s+/i, "").trim();
  return `Badko ${normalizedName || name}`;
}

function formatBranchName(name: string) {
  const normalizedName = name.replace(/^(?:hmi\s+)?cabang\s+/i, "").trim();
  return `Cabang ${normalizedName || name}`;
}

function formatTimestamp(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function ProfileField({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-[#e6e9ef] bg-[#f9fafc] p-4 ${className ?? ""}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[#69707d]">
        {label}
      </p>
      <div className="mt-1.5 text-sm font-semibold text-[#172033]">{value}</div>
    </div>
  );
}

export default function CoordinatingBodyDetailPage({
  coordinatingBody,
  branches,
  trainings,
  initialTab,
  backHref,
  allowEdit = true,
}: CoordinatingBodyDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seenTab, setSeenTab] = useState(initialTab);
  const [activeTab, setActiveTab] =
    useState<CoordinatingBodyDetailTab>(initialTab);
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  if (seenTab !== initialTab) {
    setSeenTab(initialTab);
    setActiveTab(initialTab);
  }

  function selectTab(tab: CoordinatingBodyDetailTab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "profile") params.delete("tab");
    else params.set("tab", tab);
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }

  async function handleStatusChange() {
    const nextStatus =
      coordinatingBody.status === "active" ? "inactive" : "active";
    setIsUpdatingStatus(true);

    try {
      const result = await updateCoordinatingBody({
        id: coordinatingBody.id,
        status: nextStatus,
      });
      if (!isSuccessStatus(result.status)) {
        toast.error(
          result.message ??
            `Gagal ${nextStatus === "active" ? "mengaktifkan" : "menangguhkan"} Badko.`
        );
        return;
      }

      toast.success(
        nextStatus === "active"
          ? "Badko berhasil diaktifkan."
          : "Badko berhasil disuspend."
      );
      setShowStatusConfirmation(false);
      router.refresh();
    } catch (error) {
      console.error(
        "[CoordinatingBodyDetailPage] updateCoordinatingBody threw:",
        error
      );
      toast.error("Gagal memperbarui status Badko.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href={backHref} className="inline-block w-fit">
        <Button variant="ghost">
          <ArrowLeft className="size-4" />
          Kembali ke daftar Badko
        </Button>
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageTitle>
          {formatCoordinatingBodyName(coordinatingBody.name)}
        </AdminPageTitle>
        {allowEdit && (
          <Button
            variant="primary"
            onClick={() => setShowEditForm(true)}
            className="w-fit"
          >
            <Pencil className="size-4" />
            Edit Detail
          </Button>
        )}
      </div>

      <div className="mt-6 overflow-x-auto">
        <div
          role="tablist"
          aria-label="Detail Badko"
          className="inline-flex min-w-max rounded-full border border-[#e6e9ef] bg-white p-1"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`badko-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`badko-panel-${tab.id}`}
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
        id={`badko-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`badko-tab-${activeTab}`}
        className="mt-6"
      >
        {activeTab === "profile" && (
          <section className="rounded-xl border border-[#e6e9ef] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-soft text-primary">
                {coordinatingBody.image_url ? (
                  <Image
                    src={coordinatingBody.image_url}
                    alt={coordinatingBody.name}
                    width={40}
                    height={40}
                    className="size-full object-cover"
                  />
                ) : (
                  <Building2 className="size-5" />
                )}
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#172033]">
                  Profil Badko
                </h2>
                <p className="text-sm text-[#69707d]">
                  Informasi dasar Badan Koordinasi HMI.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ProfileField
                label="Nama Badko"
                value={formatCoordinatingBodyName(coordinatingBody.name)}
              />
              <ProfileField
                label="Organisasi"
                value={coordinatingBody.organization?.name ?? "HMI"}
              />
              <ProfileField
                label="Status"
                value={
                  <Label
                    variant={
                      coordinatingBody.status === "active" ? "green" : "red"
                    }
                  >
                    {coordinatingBody.status === "active"
                      ? "Aktif"
                      : "Tidak Aktif"}
                  </Label>
                }
              />
              <ProfileField
                label="Jumlah Cabang"
                value={`${branches.length} Cabang`}
              />
              <ProfileField
                label="Tanggal Dibuat"
                value={formatTimestamp(coordinatingBody.created_at)}
              />
              <ProfileField
                label="Terakhir Diperbarui"
                value={formatTimestamp(coordinatingBody.updated_at)}
              />
              <ProfileField
                label="Deskripsi"
                value={coordinatingBody.description || "Belum ada deskripsi."}
                className="sm:col-span-2"
              />
            </div>

            <div className="mt-6 flex justify-end border-t border-[#e6e9ef] pt-5">
              {coordinatingBody.status === "active" ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowStatusConfirmation(true)}
                >
                  <Ban className="size-4" />
                  Suspend Badko ini
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setShowStatusConfirmation(true)}
                >
                  <Power className="size-4" />
                  Aktifkan Badko ini
                </Button>
              )}
            </div>
          </section>
        )}

        {activeTab === "management" && (
          <section className="overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
            <EmptyState
              title="Struktur kepengurusan belum tersedia"
              description="Data struktur kepengurusan Badko akan ditampilkan di sini setelah layanan datanya tersedia."
            />
          </section>
        )}

        {activeTab === "branches" && (
          <section className="overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
            {branches.length === 0 ? (
              <EmptyState
                title="Belum ada Cabang"
                description="Cabang yang berada di bawah Badko ini akan ditampilkan di sini."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase tracking-wide text-[#5f6573]">
                    <tr>
                      <th className="px-4 py-3">Nama Cabang</th>
                      <th className="px-4 py-3">Tipe</th>
                      <th className="px-4 py-3">Jumlah Komisariat</th>
                      <th className="px-4 py-3">Jumlah Kader</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6e9ef] text-[13px]">
                    {branches.map((branch) => (
                      <tr key={branch.id}>
                        <td className="px-4 py-3 font-semibold text-[#172033]">
                          {formatBranchName(branch.name)}
                        </td>
                        <td className="px-4 py-3">
                          <Label
                            variant={branch.type === "full" ? "blue" : "yellow"}
                          >
                            {branch.type === "full" ? "Penuh" : "Persiapan"}
                          </Label>
                        </td>
                        <td className="px-4 py-3 text-[#172033]">
                          {branch.chapter_count ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-[#172033]">
                          {branch.user_count ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Label
                            variant={
                              branch.status === "active" ? "green" : "red"
                            }
                          >
                            {branch.status === "active"
                              ? "Aktif"
                              : "Tidak Aktif"}
                          </Label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === "trainings" && (
          <section>
            {trainings.length === 0 ? (
              <div className="overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
                <EmptyState
                  title="Belum ada Latihan Kader"
                  description="Latihan Kader yang diselenggarakan Badko ini akan ditampilkan di sini."
                />
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {trainings.map((training) => (
                  <article
                    key={training.id}
                    className="rounded-xl border border-[#e6e9ef] bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-[#172033]">
                          {training.name}
                        </h2>
                        <p className="mt-1 text-sm text-[#69707d]">
                          HMI{" "}
                          {formatCoordinatingBodyName(coordinatingBody.name)}
                        </p>
                      </div>
                      <TrainingLevelLabel level={training.level} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <TrainingRegistrationLabel
                        isOpen={training.is_registration_open}
                      />
                      <TrainingStatusLabel
                        startDate={training.start_date}
                        endDate={training.end_date}
                      />
                    </div>

                    <div className="mt-4 flex flex-col gap-2 text-sm text-[#69707d]">
                      <span className="flex items-center gap-2">
                        <CalendarDays className="size-4 shrink-0" />
                        {formatDateRange(
                          training.start_date,
                          training.end_date
                        )}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="size-4 shrink-0" />
                        {training.location_name || "Lokasi belum ditentukan"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <AlertConfirmation
        open={showStatusConfirmation}
        onClose={() => setShowStatusConfirmation(false)}
        onConfirm={handleStatusChange}
        title={
          coordinatingBody.status === "active"
            ? "Suspend Badko ini?"
            : "Aktifkan Badko ini?"
        }
        message={
          coordinatingBody.status === "active"
            ? `${formatCoordinatingBodyName(coordinatingBody.name)} akan dinonaktifkan dan akses admin Badko akan dibatasi.`
            : `${formatCoordinatingBodyName(coordinatingBody.name)} akan diaktifkan kembali.`
        }
        confirmLabel={
          coordinatingBody.status === "active"
            ? "Suspend Badko"
            : "Aktifkan Badko"
        }
        confirmVariant={
          coordinatingBody.status === "active" ? "destructive" : "primary"
        }
        loading={isUpdatingStatus}
      />

      {allowEdit && (
        <EditCoordinatingBodyFormSheet
          open={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSaved={() => {
            setShowEditForm(false);
            router.refresh();
          }}
          coordinatingBody={coordinatingBody}
        />
      )}
    </div>
  );
}
