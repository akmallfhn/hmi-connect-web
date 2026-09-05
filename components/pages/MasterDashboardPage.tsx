import { BadgeCheck, Building2, Factory, Network } from "lucide-react";
import AdminPageTitle from "../common/AdminPageTitle";
import type { BranchListEntry } from "@/apis/branches";
import type {
  BranchDistribution,
  BranchMapEntry,
  BranchStatus,
  ChapterStatus,
  OrganizationSummary,
  SuspendedEntities,
  TrainingPriorities,
  UserGrowthEntry,
} from "@/apis/stat";
import AdminDashboardBanner from "../banners/AdminDashboardBanner";
import BranchMemberCountList from "../charts/BranchMemberCountList";
import CabangDistributionDonut from "../charts/CabangDistributionDonut";
import IndonesiaBranchMap from "../charts/IndonesiaBranchMap";
import KaderGrowthLineChart from "../charts/KaderGrowthLineChart";
import MasterAttentionLists from "../charts/MasterAttentionLists";
import StatCard from "../charts/StatCard";
import StatusDonut from "../charts/StatusDonut";

interface MasterDashboardPageProps {
  summary: OrganizationSummary | null;
  branchDistribution: BranchDistribution | null;
  branchMemberCounts?: BranchListEntry[] | null;
  userGrowthDay: UserGrowthEntry[];
  userGrowthWeek: UserGrowthEntry[];
  userGrowthMonth: UserGrowthEntry[];
  branchStatus: BranchStatus | null;
  chapterStatus: ChapterStatus | null;
  branchMapEntries?: BranchMapEntry[];
  trainingPriorities?: TrainingPriorities | null;
  suspendedBranches?: SuspendedEntities | null;
  suspendedCoordinatingBodies?: SuspendedEntities | null;
  // Set by the Organization dashboard so every aggregate stays scoped; /master omits it and reads unscoped.
  organizationId?: string;
  showBanner?: boolean;
  showIndonesiaMap?: boolean;
  showAttentionLists?: boolean;
}

export default function MasterDashboardPage({
  summary,
  branchDistribution,
  branchMemberCounts = null,
  userGrowthDay,
  userGrowthWeek,
  userGrowthMonth,
  branchStatus,
  chapterStatus,
  branchMapEntries = [],
  trainingPriorities = null,
  suspendedBranches = null,
  suspendedCoordinatingBodies = null,
  organizationId,
  showBanner = false,
  showIndonesiaMap = false,
  showAttentionLists = false,
}: MasterDashboardPageProps) {
  const stats = [
    {
      label: "Kader Terverifikasi",
      value: (summary?.verified_member_count ?? 0).toLocaleString("id-ID"),
      icon: BadgeCheck,
      iconBg: "bg-primary-soft",
      iconColor: "text-primary",
    },
    {
      label: "Total Cabang",
      value: (summary?.branch_count ?? 0).toLocaleString("id-ID"),
      icon: Building2,
      iconBg: "bg-secondary-soft",
      iconColor: "text-secondary",
    },
    {
      label: "Total Komisariat",
      value: (summary?.chapter_count ?? 0).toLocaleString("id-ID"),
      icon: Factory,
      iconBg: "bg-tertiary/10",
      iconColor: "text-tertiary",
    },
    {
      label: "Total Badko",
      value: (summary?.coordinating_body_count ?? 0).toLocaleString("id-ID"),
      icon: Network,
      iconBg: "bg-primary-soft",
      iconColor: "text-primary",
    },
  ];

  const branchEntries = (branchDistribution?.list ?? []).map((entry) => ({
    name: entry.branch_name,
    value: entry.total,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageTitle description="Ringkasan data keanggotaan dan struktur organisasi HMI.">
        Dashboard
      </AdminPageTitle>

      {showBanner && (
        <div className="mt-6">
          <AdminDashboardBanner />
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {showIndonesiaMap && (
        <div className="mt-4">
          <IndonesiaBranchMap
            initialBranches={branchMapEntries}
            organizationId={organizationId}
          />
        </div>
      )}

      {branchMemberCounts ? (
        <>
          <div className="mt-4">
            <KaderGrowthLineChart
              day={userGrowthDay}
              week={userGrowthWeek}
              month={userGrowthMonth}
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <CabangDistributionDonut
              entries={branchEntries}
              totalActiveKader={branchDistribution?.total_active_kader ?? 0}
            />
            <BranchMemberCountList branches={branchMemberCounts} />
          </div>
        </>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <CabangDistributionDonut
            entries={branchEntries}
            totalActiveKader={branchDistribution?.total_active_kader ?? 0}
          />
          <KaderGrowthLineChart
            day={userGrowthDay}
            week={userGrowthWeek}
            month={userGrowthMonth}
          />
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <StatusDonut
          title="Status Cabang"
          subtitle="Perbandingan Cabang penuh dan persiapan"
          centerLabel="Penuh"
          segments={[
            {
              name: "Cabang Penuh",
              value: branchStatus?.total_full ?? 0,
              color: "#159fa2",
            },
            {
              name: "Cabang Persiapan",
              value: branchStatus?.total_provisional ?? 0,
              color: "#c3c2b7",
            },
          ]}
        />
        <StatusDonut
          title="Status Komisariat"
          subtitle="Perbandingan Komisariat penuh dan persiapan"
          centerLabel="Penuh"
          segments={[
            {
              name: "Komisariat Penuh",
              value: chapterStatus?.total_full ?? 0,
              color: "#eda100",
            },
            {
              name: "Komisariat Persiapan",
              value: chapterStatus?.total_provisional ?? 0,
              color: "#c3c2b7",
            },
          ]}
        />
      </div>

      {showAttentionLists && (
        <div className="mt-6">
          <MasterAttentionLists
            organizationId={organizationId}
            trainingPriorities={trainingPriorities}
            suspendedBranches={suspendedBranches}
            suspendedCoordinatingBodies={suspendedCoordinatingBodies}
          />
        </div>
      )}
    </div>
  );
}
