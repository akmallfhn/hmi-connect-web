"use client";

import {
  ArrowLeft,
  Award,
  Ban,
  CalendarDays,
  GraduationCap,
  History,
  MapPin,
  Pencil,
  Power,
  University,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { ChapterDetail } from "@/apis/chapters";
import type { TrainingListEntry } from "@/apis/trainings";
import { updateChapter } from "@/lib/actions";
import { formatDateRange } from "@/lib/time-manipulation";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Label from "../common/Label";
import EditChapterFormSheet from "../forms/EditChapterFormSheet";
import AlertConfirmation from "../modals/AlertConfirmation";
import EmptyState from "../states/EmptyState";
import LogoHmi from "../svg/LogoHmi";
import {
  TrainingLevelLabel,
  TrainingRegistrationLabel,
  TrainingStatusLabel,
} from "../trainings/TrainingLabels";

export type ChapterDetailTab = "profile" | "management" | "trainings";

interface ChapterDetailPageProps {
  chapter: ChapterDetail;
  memberCount: number;
  trainings: TrainingListEntry[];
  initialTab: ChapterDetailTab;
  backHref: string;
  // Edit Detail is Master-only; Cabang/Korkom views of a Komisariat are read-only here.
  allowEdit?: boolean;
  // Suspend/Aktifkan is Master + Cabang; Korkom's view can't change status.
  allowStatusChange?: boolean;
}

const TABS: { id: ChapterDetailTab; label: string; icon: LucideIcon }[] = [
  { id: "profile", label: "Profil", icon: GraduationCap },
  { id: "management", label: "Kepengurusan", icon: Users },
  { id: "trainings", label: "Latihan Kader", icon: Award },
];

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

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-sm text-[#5f6573]">{label}</p>
      <p className="text-[15px] font-medium text-[#172033]">{value ?? "—"}</p>
    </div>
  );
}

export default function ChapterDetailPage({
  chapter,
  memberCount,
  trainings,
  initialTab,
  backHref,
  allowEdit = false,
  allowStatusChange = false,
}: ChapterDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seenTab, setSeenTab] = useState(initialTab);
  const [activeTab, setActiveTab] = useState<ChapterDetailTab>(initialTab);
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  if (seenTab !== initialTab) {
    setSeenTab(initialTab);
    setActiveTab(initialTab);
  }

  function selectTab(tab: ChapterDetailTab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "profile") params.delete("tab");
    else params.set("tab", tab);
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }

  async function handleStatusChange() {
    const nextStatus = chapter.status === "active" ? "inactive" : "active";
    setIsUpdatingStatus(true);

    try {
      const result = await updateChapter({
        id: chapter.id,
        status: nextStatus,
      });
      if (!isSuccessStatus(result.status)) {
        toast.error(
          result.message ??
            `Gagal ${nextStatus === "active" ? "mengaktifkan" : "menangguhkan"} Komisariat.`
        );
        return;
      }

      toast.success(
        nextStatus === "active"
          ? "Komisariat berhasil diaktifkan."
          : "Komisariat berhasil disuspend."
      );
      setShowStatusConfirmation(false);
      router.refresh();
    } catch (error) {
      console.error("[ChapterDetailPage] updateChapter threw:", error);
      toast.error("Gagal memperbarui status Komisariat.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href={backHref} className="inline-block w-fit">
        <Button variant="ghost">
          <ArrowLeft className="size-4" />
          Kembali ke daftar Komisariat
        </Button>
      </Link>

      <section className="mt-4 rounded-xl border border-[#e6e9ef] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e6e9ef] bg-primary-soft text-primary">
              {chapter.image_url ? (
                <Image
                  src={chapter.image_url}
                  alt={chapter.name}
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
                  {formatChapterName(chapter.name)}
                </h2>
                <Label variant={chapter.status === "active" ? "green" : "red"}>
                  {chapter.status === "active" ? "Status: Aktif" : "Status: Tidak Aktif"}
                </Label>
                <Label variant={chapter.type === "full" ? "blue" : "yellow"}>
                  {chapter.type === "full"
                    ? "Status Kepengurusan: Penuh"
                    : "Status Kepengurusan: Persiapan"}
                </Label>
              </div>
              <p className="mt-1 text-sm text-[#69707d]">
                Cabang {chapter.branch_name ?? "—"}
                {chapter.coordinating_chapter_name
                  ? ` • Korkom ${chapter.coordinating_chapter_name}`
                  : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {allowStatusChange &&
              (chapter.status === "active" ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowStatusConfirmation(true)}
                  className="w-fit shrink-0"
                >
                  <Ban className="size-4" />
                  Suspend Komisariat ini
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setShowStatusConfirmation(true)}
                  className="w-fit shrink-0"
                >
                  <Power className="size-4" />
                  Aktifkan Komisariat ini
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

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatPill icon={Users} label="Jumlah Kader" value={memberCount} />
          <StatPill
            icon={CalendarDays}
            label="Dibuat"
            value={formatTimestamp(chapter.created_at)}
          />
          <StatPill
            icon={History}
            label="Diperbarui"
            value={formatTimestamp(chapter.updated_at)}
          />
        </div>
      </section>

      <div className="mt-6 overflow-x-auto">
        <div
          role="tablist"
          aria-label="Detail Komisariat"
          className="inline-flex min-w-max rounded-full border border-[#e6e9ef] bg-white p-1"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`chapter-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`chapter-panel-${tab.id}`}
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
        id={`chapter-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`chapter-tab-${activeTab}`}
        className="mt-6"
      >
        {activeTab === "profile" && (
          <div className="flex flex-col gap-4">
            <section className="rounded-xl border border-[#e6e9ef] bg-white p-5 sm:p-6">
              <h3 className="text-base font-semibold text-[#172033]">
                Informasi Komisariat
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <Field label="Cabang" value={chapter.branch_name} />
                <Field
                  label="Korkom"
                  value={chapter.coordinating_chapter_name}
                />
                <Field
                  label="Asal Universitas"
                  value={
                    chapter.institution_name ? (
                      <span className="flex items-center gap-2">
                        <University className="size-4 shrink-0 text-[#5f6573]" />
                        {chapter.institution_name}
                      </span>
                    ) : undefined
                  }
                />
              </div>
            </section>

            <section className="rounded-xl border border-[#e6e9ef] bg-white p-5 sm:p-6">
              <h3 className="text-base font-semibold text-[#172033]">
                Deskripsi
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#40454f]">
                {chapter.description || "Belum ada deskripsi."}
              </p>
            </section>
          </div>
        )}

        {activeTab === "management" && (
          <section className="overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
            <EmptyState
              title="Struktur kepengurusan belum tersedia"
              description="Data struktur kepengurusan Komisariat akan ditampilkan di sini setelah layanan datanya tersedia."
            />
          </section>
        )}

        {activeTab === "trainings" && (
          <section>
            {trainings.length === 0 ? (
              <div className="overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
                <EmptyState
                  title="Belum ada Latihan Kader"
                  description="Latihan Kader yang diselenggarakan Komisariat ini akan ditampilkan di sini."
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
                          HMI {formatChapterName(chapter.name)}
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
          chapter.status === "active"
            ? "Suspend Komisariat ini?"
            : "Aktifkan Komisariat ini?"
        }
        message={
          chapter.status === "active"
            ? `${formatChapterName(chapter.name)} akan dinonaktifkan dan akses admin Komisariat akan dibatasi.`
            : `${formatChapterName(chapter.name)} akan diaktifkan kembali.`
        }
        confirmLabel={
          chapter.status === "active" ? "Suspend Komisariat" : "Aktifkan Komisariat"
        }
        confirmVariant={chapter.status === "active" ? "destructive" : "primary"}
        loading={isUpdatingStatus}
      />

      {allowEdit && (
        <EditChapterFormSheet
          open={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSaved={() => {
            setShowEditForm(false);
            router.refresh();
          }}
          chapter={chapter}
        />
      )}
    </div>
  );
}
