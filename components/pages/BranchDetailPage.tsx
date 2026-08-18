"use client";

import {
  ArrowLeft,
  Award,
  Ban,
  Building,
  CalendarDays,
  GraduationCap,
  History,
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
import type { BranchDetail } from "@/apis/branches";
import type { ChapterListEntry } from "@/apis/chapters";
import type { TrainingListEntry } from "@/apis/trainings";
import { updateBranch } from "@/lib/actions";
import { formatDateRange } from "@/lib/time-manipulation";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Label from "../common/Label";
import EditBranchFormSheet from "../forms/EditBranchFormSheet";
import AlertConfirmation from "../modals/AlertConfirmation";
import EmptyState from "../states/EmptyState";
import LogoHmi from "../svg/LogoHmi";
import {
  TrainingLevelLabel,
  TrainingRegistrationLabel,
  TrainingStatusLabel,
} from "../trainings/TrainingLabels";

export type BranchDetailTab = "profile" | "management" | "chapters" | "trainings";

interface BranchDetailPageProps {
  branch: BranchDetail;
  chapters: ChapterListEntry[];
  trainings: TrainingListEntry[];
  initialTab: BranchDetailTab;
  backHref: string;
  // Master manages Cabang directly; Organization's view of a Cabang is read-only (mirrors allowDelete on the list page).
  allowEdit?: boolean;
  // Hides the Suspend/Aktifkan action — a Badko's own scoped "Kelola Cabang" detail page can't change its Cabang's status.
  allowStatusChange?: boolean;
  // Passed through to the Edit sheet — locks the Badko field when viewed from a Badko's own scoped "Kelola Cabang" page.
  lockCoordinatingBody?: boolean;
}

const TABS: { id: BranchDetailTab; label: string; icon: LucideIcon }[] = [
  { id: "profile", label: "Profil", icon: Building },
  { id: "management", label: "Kepengurusan", icon: Users },
  { id: "chapters", label: "Daftar Komisariat", icon: GraduationCap },
  { id: "trainings", label: "Latihan Kader", icon: Award },
];

function formatBranchName(name: string) {
  const normalizedName = name.replace(/^(?:hmi\s+)?cabang\s+/i, "").trim();
  return `Cabang ${normalizedName || name}`;
}

function formatChapterName(name: string) {
  const normalizedName = name.replace(/^(?:hmi\s+)?komisariat\s+/i, "").trim();
  return `Komisariat ${normalizedName || name}`;
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

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#e6e9ef] bg-[#f9fafc] px-4 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13px] text-[#5f6573]">{label}</p>
        <p className="truncate text-[15px] font-bold text-[#172033]">{value}</p>
      </div>
    </div>
  );
}

export default function BranchDetailPage({
  branch,
  chapters,
  trainings,
  initialTab,
  backHref,
  allowEdit = true,
  allowStatusChange = true,
  lockCoordinatingBody = false,
}: BranchDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seenTab, setSeenTab] = useState(initialTab);
  const [activeTab, setActiveTab] = useState<BranchDetailTab>(initialTab);
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const totalUserCount = chapters.reduce(
    (sum, chapter) => sum + (chapter.user_count ?? 0),
    0
  );

  if (seenTab !== initialTab) {
    setSeenTab(initialTab);
    setActiveTab(initialTab);
  }

  function selectTab(tab: BranchDetailTab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "profile") params.delete("tab");
    else params.set("tab", tab);
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }

  async function handleStatusChange() {
    const nextStatus = branch.status === "active" ? "inactive" : "active";
    setIsUpdatingStatus(true);

    try {
      const result = await updateBranch({
        id: branch.id,
        status: nextStatus,
      });
      if (!isSuccessStatus(result.status)) {
        toast.error(
          result.message ??
            `Gagal ${nextStatus === "active" ? "mengaktifkan" : "menangguhkan"} Cabang.`
        );
        return;
      }

      toast.success(
        nextStatus === "active"
          ? "Cabang berhasil diaktifkan."
          : "Cabang berhasil disuspend."
      );
      setShowStatusConfirmation(false);
      router.refresh();
    } catch (error) {
      console.error("[BranchDetailPage] updateBranch threw:", error);
      toast.error("Gagal memperbarui status Cabang.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href={backHref} className="inline-block w-fit">
        <Button variant="ghost">
          <ArrowLeft className="size-4" />
          Kembali ke daftar Cabang
        </Button>
      </Link>

      <section className="mt-4 rounded-xl border border-[#e6e9ef] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e6e9ef] bg-primary-soft text-primary">
              {branch.image_url ? (
                <Image
                  src={branch.image_url}
                  alt={branch.name}
                  width={80}
                  height={80}
                  className="size-full object-cover"
                />
              ) : (
                <LogoHmi className="h-14 w-auto" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-[#172033]">
                  {formatBranchName(branch.name)}
                </h2>
                <Label variant={branch.status === "active" ? "green" : "red"}>
                  {branch.status === "active" ? "Status: Aktif" : "Status: Tidak Aktif"}
                </Label>
                <Label variant={branch.type === "full" ? "blue" : "yellow"}>
                  {branch.type === "full"
                    ? "Status Kepengurusan: Penuh"
                    : "Status Kepengurusan: Persiapan"}
                </Label>
              </div>
              <p className="mt-1 text-sm text-[#69707d]">
                {branch.coordinating_body
                  ? `Badko ${branch.coordinating_body.name}`
                  : "HMI"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {allowStatusChange &&
              (branch.status === "active" ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowStatusConfirmation(true)}
                  className="w-fit shrink-0"
                >
                  <Ban className="size-4" />
                  Suspend Cabang ini
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setShowStatusConfirmation(true)}
                  className="w-fit shrink-0"
                >
                  <Power className="size-4" />
                  Aktifkan Cabang ini
                </Button>
              ))}
            {allowEdit && (
              <Button
                variant="outline"
                onClick={() => setShowEditForm(true)}
                className="w-fit shrink-0"
              >
                <Pencil className="size-4" />
                Edit Detail
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill
            icon={GraduationCap}
            label="Jumlah Komisariat"
            value={chapters.length}
          />
          <StatPill icon={Users} label="Jumlah Kader" value={totalUserCount} />
          <StatPill
            icon={CalendarDays}
            label="Dibuat"
            value={formatTimestamp(branch.created_at)}
          />
          <StatPill
            icon={History}
            label="Diperbarui"
            value={formatTimestamp(branch.updated_at)}
          />
        </div>
      </section>

      <div className="mt-6 overflow-x-auto">
        <div
          role="tablist"
          aria-label="Detail Cabang"
          className="inline-flex min-w-max rounded-full border border-[#e6e9ef] bg-white p-1"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`branch-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`branch-panel-${tab.id}`}
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
        id={`branch-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`branch-tab-${activeTab}`}
        className="mt-6"
      >
        {activeTab === "profile" && (
          <section className="rounded-xl border border-[#e6e9ef] bg-white p-5 sm:p-6">
            <h3 className="text-base font-semibold text-[#172033]">
              Deskripsi
            </h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#40454f]">
              {branch.description || "Belum ada deskripsi."}
            </p>
          </section>
        )}

        {activeTab === "management" && (
          <section className="overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
            <EmptyState
              title="Struktur kepengurusan belum tersedia"
              description="Data struktur kepengurusan Cabang akan ditampilkan di sini setelah layanan datanya tersedia."
            />
          </section>
        )}

        {activeTab === "chapters" && (
          <section className="overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
            {chapters.length === 0 ? (
              <EmptyState
                title="Belum ada Komisariat"
                description="Komisariat yang berada di bawah Cabang ini akan ditampilkan di sini."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase tracking-wide text-[#5f6573]">
                    <tr>
                      <th className="px-4 py-3">Nama Komisariat</th>
                      <th className="px-4 py-3">Asal Universitas</th>
                      <th className="px-4 py-3">Tipe</th>
                      <th className="px-4 py-3">Jumlah Kader</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6e9ef] text-[13px]">
                    {chapters.map((chapter) => (
                      <tr key={chapter.id}>
                        <td className="px-4 py-3 font-semibold text-[#172033]">
                          {formatChapterName(chapter.name)}
                        </td>
                        <td className="px-4 py-3 text-[#172033]">
                          {chapter.institution_name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Label
                            variant={
                              chapter.type === "full" ? "blue" : "yellow"
                            }
                          >
                            {chapter.type === "full" ? "Penuh" : "Persiapan"}
                          </Label>
                        </td>
                        <td className="px-4 py-3 text-[#172033]">
                          {chapter.user_count ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Label
                            variant={
                              chapter.status === "active" ? "green" : "red"
                            }
                          >
                            {chapter.status === "active"
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
                  description="Latihan Kader yang diselenggarakan Cabang ini akan ditampilkan di sini."
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
                          HMI {formatBranchName(branch.name)}
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
          branch.status === "active"
            ? "Suspend Cabang ini?"
            : "Aktifkan Cabang ini?"
        }
        message={
          branch.status === "active"
            ? `${formatBranchName(branch.name)} akan dinonaktifkan dan akses admin Cabang akan dibatasi.`
            : `${formatBranchName(branch.name)} akan diaktifkan kembali.`
        }
        confirmLabel={
          branch.status === "active" ? "Suspend Cabang" : "Aktifkan Cabang"
        }
        confirmVariant={branch.status === "active" ? "destructive" : "primary"}
        loading={isUpdatingStatus}
      />

      {allowEdit && (
        <EditBranchFormSheet
          open={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSaved={() => {
            setShowEditForm(false);
            router.refresh();
          }}
          branch={branch}
          lockCoordinatingBody={lockCoordinatingBody}
        />
      )}
    </div>
  );
}
