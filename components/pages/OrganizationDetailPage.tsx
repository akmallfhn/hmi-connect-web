"use client";

import {
  Ban,
  Building,
  CalendarDays,
  History,
  Pencil,
  Power,
  Network,
  ShieldCheck,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { AccessGrantEntry } from "@/apis/access-grants";
import type { OrganizationDetail } from "@/apis/organizations";
import {
  activateOrganization,
  suspendOrganization,
} from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import type {
  StructuralPeriodDetail,
  StructuralPeriodSummary,
} from "@/apis/structurals";
import EntityAccessTab from "../admin/EntityAccessTab";
import Button from "../buttons/Button";
import EditOrganizationFormSheet from "../forms/EditOrganizationFormSheet";
import AlertConfirmation from "../modals/AlertConfirmation";
import Label from "../common/Label";
import StructuralPage from "./StructuralPage";
import LogoHmi from "../svg/LogoHmi";

export type OrganizationDetailTab = "profile" | "management" | "access";

interface OrganizationDetailPageProps {
  organization: OrganizationDetail;
  coordinatingBodyCount: number;
  memberCount: number;
  structuralPeriods: StructuralPeriodSummary[];
  selectedStructuralPeriod: StructuralPeriodDetail | null;
  selectedStructuralPeriodId: number | null;
  accessGrants: AccessGrantEntry[];
  canManageAccess: boolean;
  initialTab: OrganizationDetailTab;
  // Suspending the whole organization is a Master-only action.
  allowStatusChange?: boolean;
}

const TABS: { id: OrganizationDetailTab; label: string; icon: LucideIcon }[] = [
  { id: "profile", label: "Profil", icon: Building },
  { id: "management", label: "Kepengurusan", icon: Workflow },
  { id: "access", label: "Akses", icon: ShieldCheck },
];

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

export default function OrganizationDetailPage({
  organization,
  coordinatingBodyCount,
  memberCount,
  structuralPeriods,
  selectedStructuralPeriod,
  selectedStructuralPeriodId,
  accessGrants,
  canManageAccess,
  initialTab,
  allowStatusChange = false,
}: OrganizationDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seenTab, setSeenTab] = useState(initialTab);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<OrganizationDetailTab>(initialTab);

  if (seenTab !== initialTab) {
    setSeenTab(initialTab);
    setActiveTab(initialTab);
  }

  async function handleStatusChange() {
    const nextStatus = organization.status === "active" ? "inactive" : "active";
    setIsUpdatingStatus(true);

    try {
      const result =
        nextStatus === "active"
          ? await activateOrganization(organization.id)
          : await suspendOrganization(organization.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(
          result.message ??
            `Gagal ${nextStatus === "active" ? "mengaktifkan" : "menangguhkan"} organisasi.`
        );
        return;
      }

      toast.success(
        nextStatus === "active"
          ? "Organisasi berhasil diaktifkan."
          : "Organisasi berhasil disuspend."
      );
      setShowStatusConfirmation(false);
      router.refresh();
    } catch (error) {
      console.error("[OrganizationDetailPage] status change threw:", error);
      toast.error("Gagal memperbarui status organisasi.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  function selectTab(tab: OrganizationDetailTab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "profile") params.delete("tab");
    else params.set("tab", tab);
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <section className="rounded-xl border border-[#e6e9ef] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e6e9ef] bg-primary-soft text-primary">
              {organization.logo_url ? (
                <Image
                  src={organization.logo_url}
                  alt={organization.name}
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
                  {organization.name}
                </h2>
                <Label
                  variant={organization.status === "active" ? "green" : "red"}
                >
                  {organization.status === "active" ? "Aktif" : "Tidak Aktif"}
                </Label>
              </div>
              <p className="mt-1 text-sm text-[#69707d]">
                @{organization.slug}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {allowStatusChange &&
              (organization.status === "active" ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowStatusConfirmation(true)}
                  className="w-fit shrink-0"
                >
                  <Ban className="size-4" />
                  Suspend
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setShowStatusConfirmation(true)}
                  className="w-fit shrink-0"
                >
                  <Power className="size-4" />
                  Aktifkan
                </Button>
              ))}
            <Button
              variant="outline"
              onClick={() => setShowEditSheet(true)}
              className="w-fit shrink-0"
            >
              <Pencil className="size-4" />
              Edit Detail
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill
            icon={Network}
            label="Jumlah Badko"
            value={coordinatingBodyCount}
          />
          <StatPill icon={Users} label="Jumlah Kader" value={memberCount} />
          <StatPill
            icon={CalendarDays}
            label="Dibuat"
            value={formatTimestamp(organization.created_at)}
          />
          <StatPill
            icon={History}
            label="Diperbarui"
            value={formatTimestamp(organization.updated_at)}
          />
        </div>
      </section>

      <div className="mt-6 overflow-x-auto">
        <div
          role="tablist"
          aria-label="Detail Organisasi"
          className="inline-flex min-w-max rounded-full border border-[#e6e9ef] bg-white p-1"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`organization-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`organization-panel-${tab.id}`}
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
        id={`organization-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`organization-tab-${activeTab}`}
        className="mt-6"
      >
        {activeTab === "profile" && (
          <section className="rounded-xl border border-[#e6e9ef] bg-white p-5 sm:p-6">
            <h3 className="text-base font-semibold text-[#172033]">
              Informasi Organisasi
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <Field label="Nama Organisasi" value={organization.name} />
              <Field label="Slug" value={organization.slug} />
              <Field
                label="Status"
                value={
                  organization.status === "active" ? "Aktif" : "Tidak Aktif"
                }
              />
              <Field label="Jumlah Badko" value={coordinatingBodyCount} />
            </div>
          </section>
        )}

        {activeTab === "management" && (
          <StructuralPage
            entityType="organization"
            entityId={organization.id}
            periods={structuralPeriods}
            selectedPeriod={selectedStructuralPeriod}
            selectedPeriodId={selectedStructuralPeriodId}
            canManage={false}
            embedded
          />
        )}

        {activeTab === "access" && (
          <EntityAccessTab
            entityType="organization"
            entityId={organization.id}
            grants={accessGrants}
            canManageAccess={canManageAccess}
          />
        )}
      </div>

      <AlertConfirmation
        open={showStatusConfirmation}
        onClose={() => setShowStatusConfirmation(false)}
        onConfirm={handleStatusChange}
        title={
          organization.status === "active"
            ? "Suspend organisasi ini?"
            : "Aktifkan organisasi ini?"
        }
        message={
          organization.status === "active"
            ? `${organization.name} akan dinonaktifkan beserta seluruh Badko, Cabang, Korkom, dan Komisariat di bawahnya.`
            : `${organization.name} akan diaktifkan kembali.`
        }
        confirmLabel={
          organization.status === "active"
            ? "Suspend Organisasi"
            : "Aktifkan Organisasi"
        }
        confirmVariant={
          organization.status === "active" ? "destructive" : "primary"
        }
        loading={isUpdatingStatus}
      />

      <EditOrganizationFormSheet
        open={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        onSaved={() => {
          setShowEditSheet(false);
          router.refresh();
        }}
        organization={organization}
      />
    </div>
  );
}
